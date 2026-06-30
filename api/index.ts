import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'api', 'predictions.json');

interface Prediction {
  userName: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedOutcome: '1' | 'X' | '2';
  timestamp: string;
}

interface Data {
  predictions: { [userName: string]: Prediction[] };
  matches: any[];
}

function readData(): Data {
  try {
    const content = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { predictions: {}, matches: [] };
  }
}

function writeData(data: Data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const data = readData();

  if (req.method === 'GET') {
    // Return all predictions
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Save a prediction
    const prediction: Prediction = req.body;

    if (!prediction.userName || !prediction.matchId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!data.predictions[prediction.userName]) {
      data.predictions[prediction.userName] = [];
    }

    // Remove existing prediction for same match if exists
    data.predictions[prediction.userName] = data.predictions[prediction.userName].filter(
      p => p.matchId !== prediction.matchId
    );

    // Add new prediction
    prediction.timestamp = new Date().toISOString();
    data.predictions[prediction.userName].push(prediction);

    writeData(data);

    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'PUT' && req.query['admin'] === 'true') {
    // Admin: update entire data
    writeData(req.body);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
