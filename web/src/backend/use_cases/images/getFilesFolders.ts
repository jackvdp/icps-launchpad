import {list} from '@vercel/blob';
import {siteStore} from 'backend/services/blob/siteStore';

export type FolderStructure = {
    folderName: string;
    files: string[];
}

export const getFileAndFolderNames = async (): Promise<FolderStructure[]> => {
    try {
        // Get all files in the 'hd' folder
        const {folders} = await list({
            prefix: 'hd/',
            mode: 'folded',
            ...siteStore()
        });

        // Process each folder
        const folderPromises = folders?.map(async (folderPath) => {
            // Get files in this specific folder
            const {blobs: folderBlobs} = await list({
                prefix: folderPath,
                ...siteStore()
            });

            // Extract the folder name from the full path
            const folderName = folderPath.split('/').slice(-2, -1)[0];

            // Map the blobs to their URLs
            const files = folderBlobs.map(blob => blob.url);

            return {
                folderName,
                files
            };
        }) || [];

        // Wait for all folder processing to complete
        const results = await Promise.all(folderPromises);

        // Filter out any potential null results
        return results.filter((result): result is FolderStructure =>
            result !== null && result.folderName !== undefined
        );

    } catch (err) {
        console.error('Error fetching folders from Vercel Blob:', err);
        throw err;
    }
};