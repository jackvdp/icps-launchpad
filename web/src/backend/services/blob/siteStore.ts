// The site's own Blob store: public, holding images and nomination documents.
//
// Pass this to every put, list and del the site makes. Without an explicit
// token the Blob package prefers BLOB_STORE_ID to BLOB_READ_WRITE_TOKEN, and
// connecting a second store to the Vercel project (the private backup store,
// for one) sets BLOB_STORE_ID to that store. The site's uploads and gallery
// listing then go to the wrong store without any error at deploy time.
export function siteStore(): { token: string | undefined } {
    return { token: process.env.BLOB_READ_WRITE_TOKEN };
}
