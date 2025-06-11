
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
import rehypeRaw from 'rehype-raw'; // Allows rendering links
import remarkGfm from "remark-gfm"; // enables raw HTML like <a>

// File icons
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'txt': return '📃';
    case 'md':
    case 'markdown': return '📝';
    default: return '📁';
  }
};

/**
 * Renders the chatbot page where the user can enter a prompt and upload a file.
 *
 * @component
 * @returns {JSX.Element} The chatbot UI component
 */

const allowedExtensions = ['pdf', 'txt', 'md', 'markdown'];

export default function Page() {
  // Set default values
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);  // Changes the button label
  const [files, setFiles] = useState([]); // File upload state

  // Validate and handle added files
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return allowedExtensions.includes(ext);
    });

    const invalid = selected.filter(file => !valid.includes(file));
    if (invalid.length > 0) {
      alert("Some files were not added: only PDF, TXT, MD, and Markdown files are allowed.");
    }

    // Combine without duplicates
    setFiles(prev => [...prev, ...valid]);
    e.target.value = null; // Clear input for future changes
  };

  // Remove a file by index
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the form from submitting and reloading the page

    if (!userPrompt.trim()) {
    alert("Please enter a question before submitting.");
    return;
  }

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
      <h1>Hello! How can I help?</h1>
      <p>Ask me anything about RMIT courses</p>

      <form onSubmit={handleSubmit}> {/* Calls the handleSubmit function when user submits the form */}
        <textarea
          id="userPrompt"
          name="userPrompt"
          placeholder="How may I assist you?"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          rows={3}
        />

        <div className="file-upload">
          <label htmlFor="fileInput" className="upload-button">
            📎 {files.length > 0 ? `${files.length} file(s) selected` : 'Browse files'}
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.txt,.md,.markdown"
            multiple
            onChange={handleFileChange}
          />
        </div>


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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        >
          {response}
        </ReactMarkdown>
      </div>
)}
    </main>
  );
}