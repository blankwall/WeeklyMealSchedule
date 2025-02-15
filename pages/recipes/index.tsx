import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import RootLayout from '@/app/layout';
import '@/pages/recipes/style.css';  // Import the CSS file

export default function RecipesPage({ recipe, recipeList, error }) {
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
          <Link href="/recipes" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to recipe list
          </Link>
        </div>
      </div>
    );
  }

  if (recipe) {
    return (
      <div
        className="min-h-screen p-8 bg-gray-50"
        dangerouslySetInnerHTML={{ __html: recipe }}
      />
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Our Recipes</h1>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Recipe Name</th>
                </tr>
              </thead>
              <tbody>
                {recipeList.map((recipeName) => (
                  <tr key={recipeName}>
                    <td>
                      <Link
                        href={`/recipes?recipe=${recipeName}`}
                        className="recipe-link"
                      >
                        {recipeName.replace('.html', '').replace(/_/g, ' ')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

export async function getServerSideProps({ query }) {
  const recipesDir = path.join(process.cwd(), 'recipes');

  try {
    // Ensure recipes directory exists
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }

    // If a specific recipe is requested
    if (query.recipe) {
      const filePath = path.join(recipesDir, query.recipe);

      // Check if the requested recipe exists
      if (!fs.existsSync(filePath)) {
        return {
          props: {
            error: `Recipe "${query.recipe}" not found, please click Create Recipe and try again`
          }
        };
      }

      // Read and return the recipe HTML
      const recipe = fs.readFileSync(filePath, 'utf8');
      return {
        props: {
          recipe
        }
      };
    }

    // Otherwise, return list of all recipes
    const recipeList = fs.readdirSync(recipesDir)
      .filter(file => file.endsWith('.html'))
      .sort();

    return {
      props: {
        recipeList
      }
    };
  } catch (error) {
    console.error('Error accessing recipes:', error);
    return {
      props: {
        error: 'Error accessing recipes'
      }
    };
  }
}
