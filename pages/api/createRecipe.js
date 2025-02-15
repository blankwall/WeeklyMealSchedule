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
    const { day, additionalInput } = req.body; // Get the day and additionalData from the request body

    // Read the meals data from meals.json
    const mealsPath = path.join(process.cwd(), 'data', 'meals.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsPath, 'utf8'));

    // Find the meal for the specific day
    const meal = mealsData.find((meal) => meal.day === day);
    if (!meal) {
      return res.status(404).json({ message: `Meal for ${day} not found` });
    }

    // Construct the prompt for Claude, including additionalData
    let prompt = `Create a complete HTML webpage for a kid-friendly recipe with these details:
    Name: ${meal.meal}
    Description: ${meal.description}
    Side: ${meal.side}
    Protein: ${meal.protein}
    
    Please create a complete, standalone HTML page that:
    1. Uses modern, attractive styling with Tailwind CSS classes
    2. Has a responsive layout that works on mobile and desktop
    3. Includes complete <head> metadata
    4. Organizes the recipe information clearly with:
       - Recipe name as the main heading
       - Description section
       - Ingredients list
       - Step-by-step instructions
       - Side dish and protein information
       - Fun, kid-friendly visual styling
    `;

    // If additional data is provided, append it to the prompt
    if (additionalInput) {
      prompt += `\nAdditional Information: ${additionalInput}\n`;
    }

    prompt += "Only return HTML file"

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Get the raw HTML content from Claude's response
    const htmlContent = response.content[0].text;

    // Create recipes directory if it doesn't exist
    const recipesDir = path.join(process.cwd(), 'recipes');
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }

    // Create filename from meal name (convert spaces to underscores)
    const filename = `${meal.meal.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.html`;
    const filePath = path.join(recipesDir, filename);

    // Save the raw HTML content to a file
    fs.writeFileSync(filePath, htmlContent);

    // Return success response
    res.status(200).json({
      message: 'Recipe generated and saved successfully',
      savedTo: filename,
      content: htmlContent,
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ message: 'Error generating recipe' });
  }
}
