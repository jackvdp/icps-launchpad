// Lists the daily backups in the private Blob store `electoral-backups` and
// downloads one.
//
// The cron at /api/cron/backup (see vercel.json) writes one file a day,
// mongodb/<UTC time>.json.gz, holding every database on the cluster. Inside it,
// databases.<db>.<collection> has the collection's indexes, options and
// documents, in canonical Extended JSON so every value keeps its type
// (BSON.EJSON.parse turns it back into documents ready to insert).
//
// Run from web/:
//   node --env-file=.env.local scripts/fetch-backup.mjs            list them
//   node --env-file=.env.local scripts/fetch-backup.mjs latest     download the newest
//   node --env-file=.env.local scripts/fetch-backup.mjs mongodb/2026-10-04T02-00-07Z.json.gz
//
// Downloads go to ~/Backups/electoral-mongodb/blob/, readable by this user only.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { gunzipSync } from "node:zlib";
import { get, list } from "@vercel/blob";
import mongoose from "mongoose";

const { BSON } = mongoose.mongo;

const token = process.env.BACKUP_BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BACKUP_BLOB_READ_WRITE_TOKEN is not set in .env.local");
  process.exit(1);
}

const blobs = [];
let cursor;
do {
  const page = await list({ prefix: "mongodb/", cursor, token });
  blobs.push(...page.blobs);
  cursor = page.cursor;
} while (cursor);
blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));

const want = process.argv[2];
if (!want) {
  for (const b of blobs) {
    console.log(`${b.pathname}  ${String(b.size).padStart(9)} bytes`);
  }
  console.log(`\n${blobs.length} backup(s).`);
  process.exit(0);
}

const pathname = want === "latest" ? blobs.at(-1)?.pathname : want;
if (!pathname) {
  console.error("No backups found.");
  process.exit(1);
}

const result = await get(pathname, { access: "private", token });
if (result?.statusCode !== 200) {
  console.error(`Could not read ${pathname}`);
  process.exit(1);
}
const body = Buffer.from(await new Response(result.stream).arrayBuffer());

const dir = join(homedir(), "Backups", "electoral-mongodb", "blob");
mkdirSync(dir, { recursive: true, mode: 0o700 });
const file = join(dir, basename(pathname));
writeFileSync(file, body, { mode: 0o600 });

// Unpack it, so a file that cannot be restored is noticed here.
const backup = BSON.EJSON.parse(gunzipSync(body).toString("utf8"), {
  relaxed: false,
});
let total = 0;
for (const [db, collections] of Object.entries(backup.databases)) {
  for (const [name, c] of Object.entries(collections)) {
    console.log(
      `${`${db}.${name}`.padEnd(46)} ${String(c.documents.length).padStart(5)} documents`,
    );
    total += c.documents.length;
  }
}
console.log(
  `\nTaken ${new Date(backup.takenAt).toISOString()}, ${total} documents (file says ${Number(backup.documents)}), ${body.length} bytes\nsha256 ${createHash("sha256").update(body).digest("hex")}\n${file}`,
);
if (total !== Number(backup.documents)) process.exit(1);
