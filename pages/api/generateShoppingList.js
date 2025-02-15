import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize Anthropic client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { pathName } = req.body; // Get the day and additionalData from the request body

    console.log(`Generating List for ${pathName}`)
    // Path to the meals data, shopping list, and hash file
    const mealsPath = path.join(process.cwd(), 'data', pathName);
    const shoppingListPath = path.join(process.cwd(), 'data', 'shopping_list.json');
    const hashPath = path.join(process.cwd(), 'data', 'shopping_list_hash.txt');

    // Read meals.json
    const mealsData = fs.readFileSync(mealsPath, 'utf8');
    const currentHash = crypto.createHash('md5').update(mealsData).digest('hex');

    // Check if the hash is the same as the saved one
    if (fs.existsSync(hashPath)) {
      const savedHash = fs.readFileSync(hashPath, 'utf8');
      if (savedHash === currentHash) {
        console.log("Same hash returning saved data")
        // Hash matches, return the existing shopping list
        const existingList = JSON.parse(fs.readFileSync(shoppingListPath, 'utf8'));
        return res.status(200).json({
          list: existingList,
          hash: currentHash
        });
      }
    }

    // Create the prompt
    const prompt = `create a shopping list from these meals. 
    Categorize the list into two sections, items that are needed every time (such as fresh ingredients, chicken,carrots,eggs,cheese usually measured in cups or pounds) 
    and a second list that is of items that you most likely have around the house. Include items such as spices and sauces or cans that are needed. Return only the list in JSON format with a key for name should not be two names,quantity should not be null guess based on what is in the meal plan , notes for anything else seemingly important about the item, 
    Only return JSON data nothing else
    In this format 

    {
      "fresh_items": [
        {
          "name": "Ground beef/turkey",
          "quantity": "1 lb",
          "notes": "For burgers"
        }
      ], 
      "pantry_items": [
        {
          "name": "Spaghetti",
          "quantity": "1 lb",
          "notes": "For pasta"
        }
      ]
    }

    ${mealsData}`;

    // Call Claude
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.2,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    console.log('Claude response:', message.content[0].text);

    // Parse the response
    const shoppingList = JSON.parse(message.content[0].text);

    // Save the new shopping list and hash
    fs.writeFileSync(shoppingListPath, JSON.stringify(shoppingList, null, 2));
    fs.writeFileSync(hashPath, currentHash);

    res.status(200).json({
      list: shoppingList,
      hash: currentHash
    });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ message: 'Error generating shopping list' });
  }
}
