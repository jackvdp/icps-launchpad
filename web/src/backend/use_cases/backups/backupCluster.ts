import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { put } from '@vercel/blob';
import mongoose from 'mongoose';
import dbConnect from 'backend/mongo';

// A copy of every database on the cluster, which has no backups of its own.
// Reads only.
//
// The copy is one gzipped JSON file in the private Blob store
// `electoral-backups`. It holds contact details and password hashes, so it must
// never go to the site's public store: the upload asks for private access and
// fails if the store is not private.

export type BackupResult = {
    pathname: string;
    bytes: number;
    sha256: string;
    documents: number;
    databases: Record<string, Record<string, number>>;
};

type CollectionCopy = {
    indexes: unknown[];
    options: unknown;
    documents: unknown[];
};

export async function backupCluster(): Promise<BackupResult> {
    const token = process.env.BACKUP_BLOB_READ_WRITE_TOKEN;
    if (!token) {
        throw new Error('BACKUP_BLOB_READ_WRITE_TOKEN is not set');
    }

    await dbConnect();
    const client = mongoose.connection.getClient();
    const takenAt = new Date();
    const { databases } = await client.db('admin').command({ listDatabases: 1 });

    const copy: Record<string, Record<string, CollectionCopy>> = {};
    const counts: Record<string, Record<string, number>> = {};
    let total = 0;

    for (const { name } of databases as { name: string }[]) {
        if (['admin', 'local', 'config'].includes(name)) continue;
        const database = client.db(name);
        copy[name] = {};
        counts[name] = {};

        for (const info of await database.listCollections().toArray()) {
            if (info.type !== 'collection' || info.name.startsWith('system.')) continue;
            const collection = database.collection(info.name);
            // Unpromoted, so an integer comes back as the integer type it was
            // stored as and the file restores to exactly what was there.
            const documents = await collection.find({}, { promoteValues: false }).toArray();
            const expected = await collection.countDocuments();
            if (documents.length !== expected) {
                throw new Error(`${name}.${info.name}: read ${documents.length} of ${expected}`);
            }
            copy[name][info.name] = {
                indexes: await collection.indexes(),
                options: 'options' in info ? info.options : {},
                documents,
            };
            counts[name][info.name] = documents.length;
            total += documents.length;
        }
    }

    const body = gzipSync(
        mongoose.mongo.BSON.EJSON.stringify(
            { takenAt, documents: total, databases: copy },
            { relaxed: false }
        )
    );
    const stamp = takenAt.toISOString().slice(0, 19).replace(/:/g, '-');
    const blob = await put(`mongodb/${stamp}Z.json.gz`, body, {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/gzip',
        token,
    });

    return {
        pathname: blob.pathname,
        bytes: body.length,
        sha256: createHash('sha256').update(body).digest('hex'),
        documents: total,
        databases: counts,
    };
}
