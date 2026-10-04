// Copies every database on the cluster to a dated folder on this machine.
// The daily copy that Vercel's cron takes goes to Blob instead; see
// fetch-backup.mjs.
//
// Read-only against the cluster. Each collection is written three ways:
//   <db>/<collection>.bson            the documents byte for byte, in the layout
//                                     mongodump uses, so mongorestore can load it
//   <db>/<collection>.metadata.json   its indexes and options, for mongorestore
//   <db>/<collection>.jsonl           the same documents as readable JSON
// manifest.json lists the counts and a checksum for each .bson file.
//
// The copy holds nominators' contact details and the judges' password hashes,
// so the folder is readable by this user only. Keep it out of shared folders.
//
// Run from web/:  node --env-file=.env.local scripts/backup-cluster.mjs [folder]
//
// Default folder: ~/Backups/electoral-mongodb/<date and time>

import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import mongoose from "mongoose";

const { BSON, MongoClient } = mongoose.mongo;

// Local time, so the folder name matches the clock on this machine.
const now = new Date();
const stamp = [
  now.getFullYear(),
  now.getMonth() + 1,
  now.getDate(),
  now.getHours(),
  now.getMinutes(),
]
  .map((n) => String(n).padStart(2, "0"))
  .join("-");
const out =
  process.argv[2] ?? join(homedir(), "Backups", "electoral-mongodb", stamp);

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const { databases } = await client.db("admin").command({ listDatabases: 1 });

mkdirSync(out, { recursive: true, mode: 0o700 });
chmodSync(out, 0o700);

const manifest = { takenAt: new Date().toISOString(), databases: {} };
let problems = 0;

for (const { name } of databases) {
  if (["admin", "local", "config"].includes(name)) continue;
  const db = client.db(name);
  const dir = join(out, name);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  manifest.databases[name] = {};

  for (const info of await db.listCollections().toArray()) {
    if (info.type !== "collection" || info.name.startsWith("system.")) continue;
    const collection = db.collection(info.name);
    const raw = await collection.find({}, { raw: true }).toArray();
    const expected = await collection.countDocuments();

    const bson = Buffer.concat(raw);
    writeFileSync(join(dir, `${info.name}.bson`), bson, { mode: 0o600 });
    writeFileSync(
      join(dir, `${info.name}.jsonl`),
      raw
        .map((d) => BSON.EJSON.stringify(BSON.deserialize(d), { relaxed: true }))
        .join("\n") + "\n",
      { mode: 0o600 },
    );
    writeFileSync(
      join(dir, `${info.name}.metadata.json`),
      BSON.EJSON.stringify(
        {
          indexes: await collection.indexes(),
          uuid: info.info?.uuid?.toString("hex"),
          collectionName: info.name,
          type: "collection",
          options: info.options ?? {},
        },
        { relaxed: false },
      ),
      { mode: 0o600 },
    );

    // Read the file back and walk it, so a short or corrupt write is caught now.
    const written = readFileSync(join(dir, `${info.name}.bson`));
    let readBack = 0;
    for (let at = 0; at < written.length; at += written.readInt32LE(at)) {
      BSON.deserialize(written.subarray(at, at + written.readInt32LE(at)));
      readBack++;
    }
    const ok = readBack === expected && readBack === raw.length;
    if (!ok) problems++;
    manifest.databases[name][info.name] = {
      documents: readBack,
      bytes: written.length,
      sha256: createHash("sha256").update(written).digest("hex"),
    };
    console.log(
      `${ok ? "ok" : "!!"} ${`${name}.${info.name}`.padEnd(46)} ${String(readBack).padStart(5)} documents  ${String(written.length).padStart(9)} bytes${ok ? "" : `  expected ${expected}`}`,
    );
  }
}

writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), {
  mode: 0o600,
});
await client.close();

console.log(`\n${problems ? `${problems} collection(s) did not match.` : "All collections match."}\n${out}`);
if (problems) process.exit(1);
