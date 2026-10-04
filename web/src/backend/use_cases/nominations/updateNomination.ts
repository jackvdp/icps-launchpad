import { del } from '@vercel/blob';
import { siteStore } from 'backend/services/blob/siteStore';
import dbConnect from 'backend/mongo';
import Nomination, { INomination, INominationDocument } from 'backend/models/nomination';
import { isNominationsOpen } from 'data/awards-config';
import {
    NominationInput,
    UploadedFile,
    NominationValidationError,
    validateNominationInput,
    uploadNominationDocuments,
} from './createNomination';

// Thrown when a user is not allowed to edit a nomination (not theirs, or closed period).
export class NominationForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NominationForbiddenError';
    }
}

// Thrown when the target nomination does not exist.
export class NominationNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NominationNotFoundError';
    }
}

interface UpdateNominationArgs {
    id: string;
    userId: string;
    input: NominationInput;
    newFiles?: UploadedFile[];
    keepDocuments?: INominationDocument[];
}

// Editable text fields (everything except userId, documents and timestamps).
const EDITABLE_FIELDS: (keyof NominationInput)[] = [
    'nominatorName', 'nominatorOrganization', 'nominatorPosition', 'email', 'nominatorPhone',
    'nomineeName', 'nomineePosition', 'nomineeOrganization', 'nomineeEmail', 'nomineePhone',
    'awardCategory', 'initiativeDescription', 'supportingEvidence',
    'referenceName', 'referencePosition', 'referenceOrganization', 'referenceEmail', 'referencePhone',
];

export async function updateNomination({
    id,
    userId,
    input,
    newFiles = [],
    keepDocuments = [],
}: UpdateNominationArgs): Promise<INomination> {
    if (!isNominationsOpen()) {
        throw new NominationForbiddenError('The nominations period is closed; this nomination can no longer be edited.');
    }

    await dbConnect();

    const nomination = await Nomination.findById(id);
    if (!nomination) {
        throw new NominationNotFoundError('Nomination not found.');
    }
    if (!nomination.userId || nomination.userId !== userId) {
        // Don't reveal that the record exists to a non-owner.
        throw new NominationNotFoundError('Nomination not found.');
    }

    validateNominationInput(input);

    // Resolve keepDocuments against the record: kept documents take their
    // metadata from what is stored, so the client only chooses which URLs
    // survive and cannot alter or inject document entries.
    const existingDocuments = nomination.documents as INominationDocument[];
    const keptUrls = new Set(keepDocuments.map(doc => doc.url));
    const kept = existingDocuments.filter(doc => keptUrls.has(doc.url));
    const removedUrls = existingDocuments.filter(doc => !keptUrls.has(doc.url)).map(doc => doc.url);

    const uploaded = newFiles.length ? await uploadNominationDocuments(newFiles) : [];

    EDITABLE_FIELDS.forEach(field => {
        // Assigning undefined leaves optional fields unchanged; cast for mongoose doc.
        (nomination as unknown as Record<string, unknown>)[field] = input[field] ?? '';
    });
    nomination.documents = [...kept, ...uploaded];

    await nomination.save();

    // Only after a successful save: blobs for documents the user removed are
    // no longer referenced anywhere, so delete them from Vercel Blob. A
    // leaked blob is preferable to failing an update that has already saved.
    if (removedUrls.length) {
        try {
            await del(removedUrls, siteStore());
        } catch (error) {
            console.error(`Could not delete removed document blobs for nomination ${id}:`, error);
        }
    }

    return nomination;
}

export { NominationValidationError };
