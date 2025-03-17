"use client";

// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Send form data to the API route
    const res = await fetch('/api/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h1>Submit Your Name</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name: 
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      {result && (
        <div>
          <h2>Response from Server:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}