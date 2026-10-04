// upload-images.ts
import {put} from '@vercel/blob';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Types
interface ImageVersions {
    original: string;
    hd: string;
    thumbnail: string;
}

interface ProcessedImage {
    buffer: Buffer;
    width: number;
    height: number;
}

// Configuration
const MAX_HEIGHT = 1200;
const THUMBNAIL_HEIGHT = 300;
const QUALITY = 80;
const VERSION_FOLDERS = {
    original: 'original',
    hd: 'hd',
    thumbnail: 'thumbnail'
} as const;

// Image processing functions
async function processImage(filePath: string, targetHeight: number): Promise<ProcessedImage> {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.height || !metadata.width) {
        throw new Error('Could not get image dimensions');
    }

    const aspectRatio = metadata.width / metadata.height;
    const newWidth = Math.round(targetHeight * aspectRatio);

    const processedImage = await image
        .resize(newWidth, targetHeight, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({quality: QUALITY})
        .toBuffer();

    return {
        buffer: processedImage,
        width: newWidth,
        height: targetHeight
    };
}

async function createImageVersions(filePath: string): Promise<{ [key: string]: Buffer }> {
    const metadata = await sharp(filePath).metadata();
    const originalBuffer = await fs.readFile(filePath);

    const versions: { [key: string]: Buffer } = {
        original: originalBuffer
    };

    // Only create HD version if original is larger than MAX_HEIGHT
    // if (metadata.height && metadata.height > MAX_HEIGHT) {
        const hdVersion = await processImage(filePath, MAX_HEIGHT);
        versions.hd = hdVersion.buffer;
    // }

    // Always create thumbnail
    const thumbnailVersion = await processImage(filePath, THUMBNAIL_HEIGHT);
    versions.thumbnail = thumbnailVersion.buffer;

    return versions;
}

async function uploadImageVersion(
    buffer: Buffer,
    originalPath: string,
    version: keyof typeof VERSION_FOLDERS
): Promise<string> {
    // Get just the relative path by removing any absolute path components
    const cleanPath = originalPath.replace(/^.*?bucket\/photos\//, '');
    const parsedPath = path.parse(cleanPath);
    const folderStructure = path.dirname(cleanPath);

    // Create version-specific path, always including version folder
    const versionPath = path.join(
        VERSION_FOLDERS[version],
        folderStructure !== '.' ? folderStructure : '' // Don't add extra slash if no subfolder
    );

    // Create full pathname for blob
    const blobPathname = path.join(
        versionPath,
        `${parsedPath.name}${parsedPath.ext}`
    ).replace(/\\/g, '/'); // Convert Windows paths to forward slashes

    try {
        const blob = await put(blobPathname, buffer, {
            access: 'public',
            addRandomSuffix: false, // Keep original filenames
            allowOverwrite: true // Re-uploading a file replaces it, as it always has
        });

        return blob.url;
    } catch (error) {
        console.error(`Error uploading ${blobPathname}:`, error);
        throw error;
    }
}

async function processAndUploadImage(filePath: string): Promise<ImageVersions> {
    const versions = await createImageVersions(filePath);

    return {
        original: await uploadImageVersion(versions.original, filePath, 'original'),
        hd: versions.hd
            ? await uploadImageVersion(versions.hd, filePath, 'hd')
            : '',
        thumbnail: await uploadImageVersion(versions.thumbnail, filePath, 'thumbnail')
    };
}

async function* walkDirectory(dir: string): AsyncGenerator<string> {
    const dirents = await fs.readdir(dir, {withFileTypes: true});

    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* walkDirectory(res);
        } else if (isImageFile(dirent.name)) {
            yield res;
        }
    }
}

function isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    return imageExtensions.includes(path.extname(filename).toLowerCase());
}

export async function uploadAllImages(rootDir: string) {
    try {
        console.log('=== UPLOAD STARTED ===');
        console.log('Root directory:', rootDir);
        console.log('Absolute path:', path.resolve(rootDir));
        
        // Check if directory exists
        try {
            const stats = await fs.stat(rootDir);
            console.log('Directory exists:', stats.isDirectory());
        } catch (error) {
            console.error('Directory does not exist or cannot be accessed:', error);
            throw error;
        }

        // List directory contents
        try {
            const contents = await fs.readdir(rootDir);
            console.log('Directory contents:', contents);
        } catch (error) {
            console.error('Cannot read directory:', error);
        }

        const results: { [key: string]: ImageVersions } = {};
        let imageCount = 0;

        console.log('Starting to walk directory...');
        for await (const filePath of walkDirectory(rootDir)) {
            imageCount++;
            console.log(`[${imageCount}] Found image: ${filePath}`);
            console.log(`Processing ${filePath}...`);
            try {
                const relativePath = path.relative(rootDir, filePath);
                results[relativePath] = await processAndUploadImage(filePath);

                console.log(`Uploaded ${relativePath}:`);
                console.log('  Original:', results[relativePath].original);
                if (results[relativePath].hd) {
                    console.log('  HD:', results[relativePath].hd);
                }
                console.log('  Thumbnail:', results[relativePath].thumbnail);
            } catch (error) {
                console.error(`Failed to process ${filePath}:`, error);
            }
        }

        console.log(`Total images found: ${imageCount}`);

        // Save results to a JSON file
        await fs.writeFile(
            'upload-results.json',
            JSON.stringify(results, null, 2)
        );

        console.log('Upload complete! Results saved to upload-results.json');
        console.log('=== UPLOAD FINISHED ===');
        return results;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}