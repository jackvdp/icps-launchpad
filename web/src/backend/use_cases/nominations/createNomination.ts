import { put } from '@vercel/blob';
import { siteStore } from 'backend/services/blob/siteStore';
import Nomination, { INomination, INominationDocument } from 'backend/models/nomination';

// A file as produced by multer's memory storage.
export interface UploadedFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

export interface NominationInput {
    nominatorName?: string;
    nominatorOrganization?: string;
    nominatorPosition?: string;
    email?: string;
    nominatorPhone?: string;
    nomineeName?: string;
    nomineePosition?: string;
    nomineeOrganization?: string;
    nomineeEmail?: string;
    nomineePhone?: string;
    awardCategory?: string;
    initiativeDescription?: string;
    supportingEvidence?: string;
    referenceName?: string;
    referencePosition?: string;
    referenceOrganization?: string;
    referenceEmail?: string;
    referencePhone?: string;
}

// Thrown for validation failures so the API route can map them to HTTP 400.
export class NominationValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NominationValidationError';
    }
}

const DESC_MIN_WORDS = 50;
const EVIDENCE_MIN_WORDS = 150;

const countWords = (text: string): number =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

const isValidEmail = (email: string): boolean =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const isNonEmpty = (value?: string): boolean => !!value && value.trim().length > 0;

export function validateNominationInput(input: NominationInput): void {
    const required: (keyof NominationInput)[] = [
        'nominatorName', 'nominatorOrganization', 'nominatorPosition', 'email', 'nominatorPhone',
        'nomineeName', 'nomineeEmail', 'nomineePhone',
        'awardCategory', 'initiativeDescription', 'supportingEvidence',
    ];
    const missing = required.filter(field => !isNonEmpty(input[field]));
    if (missing.length) {
        throw new NominationValidationError(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!isValidEmail(input.email!)) {
        throw new NominationValidationError('Invalid nominator email address.');
    }
    if (!isValidEmail(input.nomineeEmail!)) {
        throw new NominationValidationError('Invalid nominee email address.');
    }
    if (countWords(input.initiativeDescription!) < DESC_MIN_WORDS) {
        throw new NominationValidationError(`Initiative description must be at least ${DESC_MIN_WORDS} words.`);
    }
    if (countWords(input.supportingEvidence!) < EVIDENCE_MIN_WORDS) {
        throw new NominationValidationError(`Supporting evidence must be at least ${EVIDENCE_MIN_WORDS} words.`);
    }
}

export async function uploadNominationDocuments(files: UploadedFile[]): Promise<INominationDocument[]> {
    return Promise.all(files.map(async (file) => {
        const blob = await put(
            `nominations/${Date.now()}-${file.originalname}`,
            file.buffer,
            { access: 'public', addRandomSuffix: true, ...siteStore() }
        );
        return {
            name: file.originalname,
            url: blob.url,
            size: file.size,
            contentType: file.mimetype,
        };
    }));
}

export async function createNomination(
    input: NominationInput,
    files: UploadedFile[] = [],
    userId?: string | null
): Promise<INomination> {
    validateNominationInput(input);

    const documents = files.length ? await uploadNominationDocuments(files) : [];

    const nomination = await Nomination.create({
        ...input,
        ...(userId ? { userId } : {}),
        documents,
    });

    return nomination;
}
