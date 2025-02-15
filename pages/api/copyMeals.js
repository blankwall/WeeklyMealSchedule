import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Change the path to point to the 'data' folder inside the app route
    const nextWeekPath = path.join(process.env.PWD, 'data', 'next_week.json');
    const mealsPath = path.join(process.env.PWD, 'data', 'meals.json');

    // Read the next_week.json file
    const data = fs.readFileSync(nextWeekPath, 'utf-8');
    
    // Write to meals.json
    fs.writeFileSync(mealsPath, data);

    res.status(200).json({ message: 'Meals copied successfully' });
  } catch (error) {
    console.error('Error copying meals:', error);
    res.status(500).json({ message: 'Error copying meals' });
  }
}

