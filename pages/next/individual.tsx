import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Import useRouter for page reload

export default function Home({ meals }) {
  const [editedMeal, setEditedMeal] = useState(null);
  const [mealData, setMealData] = useState({
    day: '',
    meal: '',
    description: '',
    side: '',
    protein: '',
  });

  const router = useRouter(); // Initialize router to use for reload

  const handleEditClick = (meal) => {
    setEditedMeal(meal);
    setMealData(meal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData((prevState) => ({
      ...prevState,
      [name]: value,
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
      setEditedMeal(null); // Close the form
      router.reload(); // Refresh the page after saving the changes
    } else {
      alert(result.message || 'Error updating meal');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', color: '#333', margin: 0, padding: 0, lineHeight: 1.6 }}>
      <Head>
        <title>Weekly Meal Schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Weekly Meal Schedule</h1>

        {meals.map((meal, index) => (
          <div key={index} style={{ margin: '20px 0' }}>
            <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #007BFF' }}>
              <h2 style={{ color: '#007BFF', marginBottom: '10px' }}>
                {meal.day}: {meal.meal}
              </h2>
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
  );
}

// Fetch meal data at build time
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
