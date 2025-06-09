
/**
 * Chabot UI
 *
 * [User types a prompt] → userPrompt
 * [User uploads a PDF] → file
 *
 * [User clicks Submit] → handleSubmit()
 *
 * handleSubmit() → builds FormData with prompt and file
 *               → sends to /api/chatbot/
 *
 * API (backend) → reads text and PDF, sends to AWS
 *             → returns JSON response
 *
 * Frontend → updates UI with response
**/

"use client"; // Only rendered for client-side

import { useState } from 'react'; // This is needed so that react knows that the page is updated dynamically
import ReactMarkdown from 'react-markdown'; // Optional formatting DONT USE
import '../styles/style.css';

/**
 * Renders the chatbot page where the user can enter a prompt and upload a file.
 *
 * @component
 * @returns {JSX.Element} The chatbot UI component
 */
export default function Page() {
  // Set default values
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);  // Changes the button label
  const [files, setFiles] = useState([]); // File upload state

  // Handle file input
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  // Remove a file by index
  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the form from submitting and reloading the page
    setLoading(true);
    setResponse('');

    try {
      const formData = new FormData();
      formData.append('userPrompt', userPrompt);

      files.forEach((file) => {
        formData.append('files', file); // Use 'files' as the field name
      });

      const res = await fetch('/api/chatbot/', {
        method: 'POST',
        body: formData
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
          accept=".pdf,.txt,.md,.markdown"
          multiple
          onChange={handleFileChange}
        />

        {/* File list with remove buttons */}
        {files.length > 0 && (
          <ul style={{ marginTop: '1em' }}>
            {files.map((file, index) => (
              <li key={index}>
                {file.name}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{ marginLeft: '1em' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'} 
        </button>
      </form>

      {response && (
      <div style={{ marginTop: '1em' }}>
        <strong>Response:</strong>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
)}
    </main>
  );
}