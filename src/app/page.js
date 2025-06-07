

"use client"; // Only rendered for client-side

import { useState } from 'react'; // This is needed so that react knows that the page is updated dynamically

export default function Page() {
  // Set default values
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault(); // This prevents the form from actually submitting and reloading the page
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chatbot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: userPrompt })
      });

      const data = await res.json();
      if (res.ok) {
            setResponse(data.response);
        } else {
            setResponse("Error: " + data.error);
        }
    
    } catch (err) {
        console.error('Request failed:', err);
        setResponse('Error talking to AWS.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <main>
      <h1>RMIT STEM Advisor</h1>
      <p>This AI assistant will help answer your questions related to STEM courses</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="userPrompt"
          name="userPrompt"
          placeholder="How may I assist you?"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '1em' }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}