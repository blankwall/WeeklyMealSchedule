import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {

    console.log(req.body)
    // Get the file path from the request body (use 'next_week.json' if passed, otherwise default to 'meals.json')
    const { day, additionalInput, filePath = 'meals.json' } = req.body;

    // Resolve the file path dynamically
    const mealFilePath = path.join(process.cwd(), 'data', filePath);

    console.log("File path " + mealFilePath)
    // Check if the file exists
    if (!fs.existsSync(mealFilePath)) {
      return res.status(400).json({ message: `File not found: ${filePath}` });
    }

    // Read the current meals data from the chosen file
    const meals = JSON.parse(fs.readFileSync(mealFilePath, 'utf-8'));

    // Construct the prompt for Claude
    let prompt = `Generate a kid-friendly meal for a family of 5 to replace the ${day} meal in my meal schedule. `;
    if (additionalInput) {
      prompt += `Additional requirements: ${additionalInput}. `;
    }
    prompt += `Return only a JSON object with the following structure: {
      "day": "${day}",
      "meal": "meal name",
      "description": "brief description",
      "side": "side dish",
      "protein": "protein component",
      "rating": 5
    }`;

    prompt += "Nothing else but json"
    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the response from Claude
    const newMeal = JSON.parse(response.content[0].text);

    // Update the meals array with the new meal
    const updatedMeals = meals.map(meal => 
      meal.day === day ? { ...newMeal } : meal
    );

    // Write the updated meals back to the chosen file
    fs.writeFileSync(mealFilePath, JSON.stringify(updatedMeals, null, 2));

    res.status(200).json({ message: 'Meal regenerated successfully' });
  } catch (error) {
    console.error('Error regenerating meal:', error);
    res.status(500).json({ message: 'Error regenerating meal' });
  }
}
