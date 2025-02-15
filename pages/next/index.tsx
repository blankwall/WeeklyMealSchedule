import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RootLayout from '@/app/layout';

const handleCopyMeals = async () => {
  try {
    const response = await fetch('/api/copyMeals', {
      method: 'POST',
    });
    const result = await response.json();
    if (response.ok) {
      alert('Meals copied successfully!');
    } else {
      alert(result.message || 'Error copying meals');
    }
  } catch (error) {
    alert('Error copying meals');
  }
};

export default function Home({ meals }) {
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


  const router = useRouter();

  const handleEditClick = (meal) => {
    setEditedMeal(meal);
    setMealData({
      ...meal,
      rating: meal.rating || 5
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData((prevState) => ({
      ...prevState,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/editMeal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealData),
    });

    const result = await response.json();
    if (response.ok) {
      alert('Meal updated successfully!');
      setEditedMeal(null);
      router.reload();
    } else {
      alert(result.message || 'Error updating meal');
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
          additionalInput: userInput,
          filePath: "next_week.json"
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


  // Star rating display component
  const StarRating = ({ rating, editable = false, onChange = () => {} }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        {editable ? (
          <select 
            name="rating"
            value={rating} 
            onChange={onChange}
            style={{
              padding: '10px',
              borderRadius: '20px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>
                {num} Star{num !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
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
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleCopyMeals}
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.3s ease',
            }}
          >
            Archive Current Meals
          </button>
        </div>

        {meals.map((meal, index) => (
          <div key={index} style={{ margin: '20px 0' }}>
            <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #007BFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#007BFF', marginBottom: '10px' }}>
                  {meal.day}: {meal.meal}
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
              </div>
              <div style={{ margin: '10px 0' }}>
                {editedMeal === meal ? (
                  <div>
                    <h3 style={{ color: '#007BFF', marginBottom: '15px' }}>Edit Meal</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label htmlFor="meal" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Meal Name</label>
                        <input
                          id="meal"
                          type="text"
                          name="meal"
                          value={mealData.meal}
                          onChange={handleChange}
                          placeholder="Meal"
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            width: '100%',
                            fontSize: '16px',
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={mealData.description}
                          onChange={handleChange}
                          placeholder="Description"
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            width: '100%',
                            fontSize: '16px',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="side" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Side</label>
                        <input
                          id="side"
                          type="text"
                          name="side"
                          value={mealData.side}
                          onChange={handleChange}
                          placeholder="Side"
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            width: '100%',
                            fontSize: '16px',
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="protein" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Protein</label>
                        <input
                          id="protein"
                          type="text"
                          name="protein"
                          value={mealData.protein}
                          onChange={handleChange}
                          placeholder="Protein"
                          required
                          style={{
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            width: '100%',
                            fontSize: '16px',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Rating</label>
                        <StarRating 
                          rating={mealData.rating} 
                          editable={true} 
                          onChange={handleChange} 
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#007BFF',
                          color: '#fff',
                          padding: '10px 20px',
                          borderRadius: '30px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          marginTop: '20px',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <p>{meal.description}</p>
                    <p style={{ fontStyle: 'italic', color: '#555' }}>Side: {meal.side}</p>
                    <p style={{ fontStyle: 'italic', color: '#555' }}>Protein: {meal.protein}</p>
                    <StarRating rating={meal.rating || 5} />
                    <button onClick={() => handleEditClick(meal)} style={{
                      backgroundColor: '#007BFF',
                      color: '#fff',
                      padding: '10px 15px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      marginTop: '10px',
                    }}>Edit</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </RootLayout>
  );
}

// Fetch meal data at build time
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'data', 'next_week.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const meals = JSON.parse(jsonData);

  return {
    props: {
      meals,
    },
  };
}