
/**
 * Chabot UI
 */
"use client"; // Only rendered for client-side

import { useState } from 'react'; // This is needed so that react knows that the page is updated dynamically

export default function Page() {
  // Set default values
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);  // Changes the button label

  const handleSubmit = async (e) => {
    e.preventDefault(); // This prevents the form from actually submitting and reloading the page
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chatbot/', { // 1. This calls the API via fetch
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: userPrompt })
      });

      const data = await res.json(); // 2. assign data a JSON response from index.js
      if (res.ok) {
            setResponse(data.response); // 3. if a response is recieved, assigns 'response' to data variable
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

      <form onSubmit={handleSubmit}> // 4. Calls the handleSubmit function when user submits the form
        <textarea
          id="userPrompt"
          name="userPrompt"
          placeholder="How may I assist you?"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          rows={3}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {response && ( // 5. Outputs the response
        <div style={{ marginTop: '1em' }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}