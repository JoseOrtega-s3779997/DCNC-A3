
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
  const [file, setFile] = useState(null); // File upload state

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the form from submitting and reloading the page
    setLoading(true);
    setResponse('');

    try {
      const formData = new FormData();
      formData.append('userPrompt', userPrompt);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/chatbot/', { // sends combined data to the API
        method: 'POST',
        body: formData
      });

      const data = await res.json(); // assign data a JSON response from index.js
      if (res.ok) {
        setResponse(data.response); // assign 'response' to data variable
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

      <form onSubmit={handleSubmit}> {/* Calls the handleSubmit function when user submits the form */}
        <textarea
          id="userPrompt"
          name="userPrompt"
          placeholder="How may I assist you?"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          rows={3}
        />

        <input
          type="file"
          accept=".pdf, image/jpeg, image/png, text/plain"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {response && ( // Outputs the response
        <div style={{ marginTop: '1em' }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}

// [User types a prompt] → userPrompt
// [User uploads a PDF] → file

// [User clicks Submit] → handleSubmit()

// handleSubmit() → builds FormData with prompt and file
//               → sends to /api/chatbot/

// API (backend) → reads text and PDF, sends to AWS
//              → returns JSON response

// Frontend → updates UI with response
