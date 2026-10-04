import type { NextApiRequest, NextApiResponse } from 'next';
import { backupCluster } from 'backend/use_cases/backups/backupCluster';

export const config = {
    maxDuration: 60,
};

// Run once a day by Vercel's cron (see vercel.json), which sends the project's
// CRON_SECRET as a bearer token. Nobody else can start it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    }

    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
        return res.status(401).json({ success: false, message: 'Not authorised' });
    }

    try {
        return res.status(200).json({ success: true, data: await backupCluster() });
    } catch (error) {
        console.error('Database backup failed:', error);
        return res.status(500).json({ success: false, message: 'Backup failed' });
    }
}
