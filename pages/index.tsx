import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RootLayout from '@/app/layout';


export default function Home({ meals }) {
  // const [additionalInput, setAdditionalInput] = useState('');
  const [editedMeal, setEditedMeal] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [mealData, setMealData] = useState({
    day: '',
    meal: '',
    description: '',
    side: '',
    protein: '',
    rating: 5,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [additionalInput, setAdditionalInput] = useState('');
  const [currentMeal, setCurrentMeal] = useState(null);

// Modify the mealData state to include an object for each day's rating
  const [ratings, setRatings] = useState(
    meals.reduce((acc, meal) => ({
      ...acc,
      [meal.day]: meal.rating || 5
    }), {})
  );

  // Modified handler for rating changes
 const handleRatingChange = (newRating, day) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [day]: newRating
    }));
  };


  const router = useRouter();

  const handleEditClick = (meal) => {
    console.log("Editing meal")
    console.log(meal)
    setEditedMeal(meal);
    setMealData({
      ...meal,
      rating: meal.rating || 5
    });
  };

  // Helper function to convert meal name to filename format
const getRecipeFilename = (mealName) => {
  // Replace spaces with underscores and remove all non-alphanumeric characters (except underscores)
  return `${mealName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.html`;
};

  // Helper function to check if recipe exists
  const hasRecipe = (mealName) => {
    return existingRecipes.includes(getRecipeFilename(mealName));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData((prevState) => ({
      ...prevState,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  // const handleRatingChange = (newRating, nday) => {
  //   setMealData((prevState) => ({
  //     ...prevState,
  //     day: nday,
  //     rating: newRating,
  //   }));
  // };

const handleRating = async (day) => {
    // Find the meal data directly from the meals prop
    console.log(day, typeof(day));
    let nn = ""
    // Check if 'day' is a string
    if (typeof day === 'string') {
      // If it's a string, use it directly
      console.log('Day is a string:', day);
      nn = day
    } else {
      // If it's not a string, access it like the example in your request
      nn = day.currentTarget.innerHTML;
      console.log('Accessed value from currentTarget.innerHTML:', nn);
    }
    const currentMeal = meals.find(m => m.day === nn);
    if (!currentMeal) {
      console.error('Meal not found for day:', nn);
      alert('Error: Could not find meal data');
      return;
    }

    const updateData = {
      ...currentMeal,  // Spread all existing meal data
      rating: ratings[nn]  // Update with new rating
    };

    console.log(updateData)
    try {
      const response = await fetch('/api/editRating', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Rating updated successfully!');
        router.reload();
      } else {
        alert(result.message || 'Error updating rating');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Error updating rating');
    }
  };


  const handleRegenerateClick = (day) => {
    setRegeneratingDay(day);
    setIsRegenerating(true);
  };

  const handleRegenerateSubmit = async () => {
    try {
      const response = await fetch('/api/regenerateMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: regeneratingDay,
          additionalInput: userInput
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate meal');
      }

      const result = await response.json();
      setIsRegenerating(false);
      setUserInput('');
      setRegeneratingDay(null);
      router.reload();
    } catch (error) {
      alert('Error regenerating meal: ' + error.message);
    }
  };

const handleCreateRecipe = async (meal) => {
    try {
      const response = await fetch('/api/createRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day: meal.day,additionalInput: additionalInput}),

      });

      const result = await response.json();
      if (response.ok) {
        // Create a new meal object with the recipe
        const updatedMeal = {
          ...meal,
          recipe: result
        };
        
        // Update the edited meal to trigger re-render
        setEditedMeal(null); // First clear the current edited meal
        setTimeout(() => {
          setEditedMeal(updatedMeal); // Then set the new one
        }, 0);
        alert("Succesfully Created Your Recipe")
      } else {
        alert(result.message || 'Error creating recipe');
      }
    } catch (error) {
      alert('Error creating recipe: ' + error.message);
    }
  };

  // Handle the modal toggle
  const openModal = (meal) => {
    setCurrentMeal(meal); // Set the current meal for which the recipe will be created
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAdditionalInput('');
  };

  // Create a new component for displaying the recipe
  const RecipeDisplay = ({ recipe, mealName }) => {
    console.log(mealName)
    console.log(hasRecipe(mealName))
    if (hasRecipe(mealName)) {
      return (
        <div style={{ marginTop: '20px' }}>
          <Link 
            href={`/recipes?recipe=${getRecipeFilename(mealName)}`}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px',
              marginTop: '10px'
            }}
          >
            View Recipe
          </Link>
        </div>
      );
    }


    if (!recipe) return null;

      return (
    <div style={{ 
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ color: '#007BFF', marginBottom: '15px' }}>Recipe: {recipe.name || mealName}</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{recipe.description}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '10px' }}>Ingredients:</h4>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '10px' }}>Instructions:</h4>
        <ol style={{ paddingLeft: '20px' }}>
          {recipe.instructions?.map((instruction, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{instruction}</li>
          ))}
        </ol>
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#e9ecef',
        padding: '15px',
        borderRadius: '6px',
        marginTop: '15px'
      }}>
        <div>
          <strong>Side:</strong> {recipe.side}
        </div>
        <div>
          <strong>Protein:</strong> {recipe.protein}
        </div>
        <div>
          <strong>Rating:</strong> {recipe.rating}/5
        </div>
      </div>
    </div>
  );
};

  const StarRating = ({ rating, day, editable = false, onChange = () => {} }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        {editable ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', cursor: 'pointer' }}>
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  style={{
                    color: index < ratings[day] ? '#FFD700' : '#E0E0E0',
                    fontSize: '20px',
                  }}
                  onClick={() => onChange(index + 1, day)}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '16px' }}>
              {ratings[day]}/5
            </span>
            <button
              onClick={() => handleRating(day)}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                borderRadius: '4px',
                border: '1px solid #007BFF',
                backgroundColor: '#007BFF',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Save Rating
            </button>
          </div>
        ) : (
          <div style={{ color: '#FFD700', fontSize: '20px' }}>
            {[...Array(5)].map((_, index) => (
              <span key={index} style={{ color: index < rating ? '#FFD700' : '#E0E0E0' }}>
                ★
              </span>
            ))}
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '16px' }}>
              {rating}/5
            </span>
          </div>
        )}
      </div>
    );
  };


  return (
    <RootLayout>
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', color: '#333', margin: 0, padding: 0, lineHeight: 1.6 }}>
      <Head>
        <title>Weekly Meal Schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {isRegenerating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Regenerate Meal for {regeneratingDay}</h3>
            <p>Add any specific requirements (optional):</p>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="E.g., vegetarian, gluten-free, quick prep..."
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsRegenerating(false);
                  setUserInput('');
                  setRegeneratingDay(null);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateSubmit}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Weekly Meal Schedule</h1>

        {meals.map((meal, index) => (
          <div key={index} style={{ margin: '20px 0' }}>
            <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #007BFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#007BFF', marginBottom: '10px' }}>
                  <a 
                    href={`/recipes?recipe=${getRecipeFilename(meal.meal)}`} 
                    style={{ textDecoration: 'none', color: '#007BFF' }}
                  >
                    {meal.day}: {meal.meal}
                  </a>
                </h2>
                <button
                  onClick={() => handleRegenerateClick(meal.day)}
                  style={{
                    backgroundColor: '#28a745',
                    color: '#fff',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: '10px'
                  }}
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={() => openModal(meal)}  // Open modal when creating recipe
                  style={{
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: '10px'
                  }}
                >
                  Create Recipe
                </button>
              </div>

              <div style={{ margin: '10px 0' }}>
                <p>{meal.description}</p>
                <p style={{ fontStyle: 'italic', color: '#555' }}>Side: {meal.side}</p>
                <p style={{ fontStyle: 'italic', color: '#555' }}>Protein: {meal.protein}</p>
                <StarRating
                  rating={ratings[meal.day]}
                  day={meal.day}
                  editable={true}
                  onChange={handleRatingChange}
                />
                <button onClick={handleRating}>{meal.day}</button>               
                {(meal.recipe || meal.generatedRecipe) && 
                  <RecipeDisplay 
                    recipe={meal.recipe || meal.generatedRecipe} 
                    mealName={meal.meal}
                  />


                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Additional Information */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Additional Information</h3>
            <textarea
              value={additionalInput}
              onChange={(e) => setAdditionalInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="E.g., vegetarian, gluten-free, quick prep..."
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateRecipe(currentMeal)}  // Pass current meal to the recipe creation
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RootLayout>

  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'data', 'meals.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const meals = JSON.parse(jsonData);

  return {
    props: {
      meals,
    },
  };
}
