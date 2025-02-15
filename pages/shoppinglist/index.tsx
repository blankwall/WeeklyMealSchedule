import { useState, useEffect } from 'react';
import Head from 'next/head';
import crypto from 'crypto';
import RootLayout from '@/app/layout';

export default function ShoppingList({ currentList, currentHash }) {
  const [shoppingList, setShoppingList] = useState(currentList);
  const [hash, setHash] = useState(currentHash);

  const generateList = async (listName) => {
    try {
      const response = await fetch('/api/generateShoppingList', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({'pathName':listName})
      });
      const data = await response.json();
      setShoppingList(data.list);
      setHash(data.hash);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Error generating shopping list');
    }
  };

  return (
    <RootLayout>
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Head>
        <title>Shopping List</title>
      </Head>

      <h1 style={{ textAlign: 'center' }}>Shopping List</h1>
      
      <button
        onClick={() => generateList('meals.json')}
        style={{
          backgroundColor: '#007BFF',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Generate New List for this week
      </button>
      <a>    </a>
      <button
        onClick={() => generateList('next_week.json')}
        style={{
          backgroundColor: '#007BFF',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Generate New List for next week
      </button>

      <div>
        <h2>Fresh Ingredients</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList?.fresh_items?.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.name}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.quantity}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Pantry Items</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList?.pantry_items?.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.name}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.quantity}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </RootLayout>

  );
}

export async function getServerSideProps() {
  const fs = require('fs');
  const path = require('path');

  try {
    // Path to meals.json and shopping list data
    const mealsPath = path.join(process.cwd(), 'data', 'meals.json');
    const shoppingListPath = path.join(process.cwd(), 'data', 'shopping_list.json');

    // Read meals.json
    const mealsData = fs.readFileSync(mealsPath, 'utf8');
    const currentHash = crypto.createHash('md5').update(mealsData).digest('hex');

    // If shopping list exists and hash matches, return existing list
    if (fs.existsSync(shoppingListPath)) {
        const shoppingList = JSON.parse(fs.readFileSync(shoppingListPath, 'utf8'));
        return {
          props: {
            currentList: shoppingList,
            currentHash: currentHash
          }
        };
    }

    // If no list exists or hash doesn't match, return empty list
    return {
      props: {
        currentList: { fresh_ingredients: [], pantry_ingredients: [] },
        currentHash: currentHash
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        currentList: { fresh_ingredients: [], pantry_ingredients: [] },
        currentHash: ''
      }
    };
  }
}
