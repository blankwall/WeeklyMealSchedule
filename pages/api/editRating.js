import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'PUT') {
    const { day, rating } = req.body;

    // Check if the day and rating are provided
    if (!day || rating === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate rating is a number between 0 and 5
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 0 and 5' });
    }

    try {
      // Read meals.json file
      const filePath = path.join(process.cwd(), 'data', 'meals.json');
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const meals = JSON.parse(jsonData);

      // Find the index of the meal to update based on the 'day'
      const mealIndex = meals.findIndex((m) => m.day === day);
      if (mealIndex === -1) {
        return res.status(404).json({ message: 'Meal not found' });
      }

      // Update only the rating of the meal
      meals[mealIndex].rating = rating;

      // Write the updated data back to the meals.json file
      fs.writeFileSync(filePath, JSON.stringify(meals, null, 2));

      return res.status(200).json({ message: 'Meal rating updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating meal rating', error: error.message });
    }
  } else {
    // If the method is not PUT
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
