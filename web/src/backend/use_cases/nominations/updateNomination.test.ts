import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateNomination, NominationForbiddenError, NominationNotFoundError } from './updateNomination';
import { NominationInput } from './createNomination';

const { findByIdMock, putMock, delMock } = vi.hoisted(() => ({
    findByIdMock: vi.fn(),
    putMock: vi.fn(),
    delMock: vi.fn(),
}));

vi.mock('backend/mongo', () => ({ default: vi.fn() }));
vi.mock('backend/models/nomination', () => ({ default: { findById: findByIdMock } }));
vi.mock('@vercel/blob', () => ({ put: putMock, del: delMock }));

const words = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(' ');

const validInput = (): NominationInput => ({
    nominatorName: 'Jane Smith',
    nominatorOrganization: 'Electoral Commission of Testland',
    nominatorPosition: 'Director of Elections',
    email: 'jane@example.org',
    nominatorPhone: '+441234567890',
    nomineeName: 'Testland EMB',
    nomineeEmail: 'emb@example.org',
    nomineePhone: '+449876543210',
    awardCategory: 'Accessibility Award',
    initiativeDescription: words(50),
    supportingEvidence: words(150),
});

const DOC_A = { name: 'a.pdf', url: 'https://blob.example/a.pdf', size: 1, contentType: 'application/pdf' };
const DOC_B = { name: 'b.pdf', url: 'https://blob.example/b.pdf', size: 2, contentType: 'application/pdf' };

const buildRecord = (overrides: Record<string, unknown> = {}) => ({
    userId: 'user-1',
    documents: [DOC_A, DOC_B],
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

const baseArgs = { id: 'nom-1', userId: 'user-1', input: validInput() };

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z')); // inside the nominations period
    findByIdMock.mockReset();
    putMock.mockReset();
    delMock.mockReset().mockResolvedValue(undefined);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.useRealTimers();
    consoleError.mockRestore();
});

describe('updateNomination', () => {
    it('deletes the blobs of removed documents after a successful save', async () => {
        const record = buildRecord();
        findByIdMock.mockResolvedValue(record);

        await updateNomination({ ...baseArgs, keepDocuments: [DOC_A] });

        expect(record.save).toHaveBeenCalled();
        expect(record.documents).toEqual([DOC_A]);
        expect(delMock).toHaveBeenCalledWith([DOC_B.url], expect.anything());
    });

    it('does not call del when every document is kept', async () => {
        const record = buildRecord();
        findByIdMock.mockResolvedValue(record);

        await updateNomination({ ...baseArgs, keepDocuments: [DOC_A, DOC_B] });

        expect(record.documents).toEqual([DOC_A, DOC_B]);
        expect(delMock).not.toHaveBeenCalled();
    });

    it('takes kept-document metadata from the record, not the client payload', async () => {
        const record = buildRecord();
        findByIdMock.mockResolvedValue(record);

        await updateNomination({
            ...baseArgs,
            keepDocuments: [
                // Same URL as DOC_A but with forged name/size: record's copy must win.
                { ...DOC_A, name: 'renamed.exe', size: 999999 },
                // Foreign URL not on the record: must not be stored.
                { name: 'evil.pdf', url: 'https://attacker.example/evil.pdf', size: 3, contentType: 'application/pdf' },
            ],
        });

        expect(record.documents).toEqual([DOC_A]);
        expect(delMock).toHaveBeenCalledWith([DOC_B.url], expect.anything());
    });

    it('appends newly uploaded files to the kept documents', async () => {
        const record = buildRecord();
        findByIdMock.mockResolvedValue(record);
        putMock.mockResolvedValue({ url: 'https://blob.example/new.pdf' });

        await updateNomination({
            ...baseArgs,
            keepDocuments: [DOC_A, DOC_B],
            newFiles: [{ buffer: Buffer.from('x'), originalname: 'new.pdf', mimetype: 'application/pdf', size: 1 }],
        });

        expect(record.documents).toEqual([
            DOC_A,
            DOC_B,
            { name: 'new.pdf', url: 'https://blob.example/new.pdf', size: 1, contentType: 'application/pdf' },
        ]);
        expect(delMock).not.toHaveBeenCalled();
    });

    it('still succeeds and logs when blob deletion fails', async () => {
        const record = buildRecord();
        findByIdMock.mockResolvedValue(record);
        delMock.mockRejectedValue(new Error('blob store unavailable'));

        const result = await updateNomination({ ...baseArgs, keepDocuments: [DOC_A] });

        expect(result).toBe(record);
        expect(record.save).toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('nom-1'),
            expect.any(Error),
        );
    });

    it('does not delete blobs when the save fails', async () => {
        const record = buildRecord();
        record.save.mockRejectedValue(new Error('db down'));
        findByIdMock.mockResolvedValue(record);

        await expect(updateNomination({ ...baseArgs, keepDocuments: [DOC_A] })).rejects.toThrow('db down');

        expect(delMock).not.toHaveBeenCalled();
    });

    it('refuses edits outside the nominations period', async () => {
        vi.setSystemTime(new Date('2026-12-15T12:00:00Z')); // after the period closes

        await expect(updateNomination({ ...baseArgs })).rejects.toThrow(NominationForbiddenError);
        expect(findByIdMock).not.toHaveBeenCalled();
    });

    it('reports not-found for missing records and records owned by someone else', async () => {
        findByIdMock.mockResolvedValue(null);
        await expect(updateNomination({ ...baseArgs })).rejects.toThrow(NominationNotFoundError);

        findByIdMock.mockResolvedValue(buildRecord({ userId: 'someone-else' }));
        await expect(updateNomination({ ...baseArgs })).rejects.toThrow(NominationNotFoundError);
        expect(delMock).not.toHaveBeenCalled();
    });
});
