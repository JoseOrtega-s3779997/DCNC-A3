/** 
 * API backend for processing user inputs and receiving index.js output.
 * 
 * This route handles POST requests with multipart/form-data,
 * optionally containing a PDF file and a text prompt.
 * It extracts the PDF content and sends it along with the prompt
 * to the AWS Bedrock model for AI-based response generation.
 */

import formidable from 'formidable';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';
import { invokeBedrock } from '../../../lib/index.js';

/**
 * Configuration to disable automatic body parsing by Next.js,
 * allowing us to manually parse multipart form data.
 */
export const config = {
  api: { bodyParser: false }
};

/**
 * Parses multipart/form-data from the incoming request using formidable.
 *
 * @param {Request} req - The incoming Next.js API request.
 * @returns {Promise<{fields: Record<string, string[]>, files: Record<string, formidable.File[]>}>}
 *          Resolves with parsed form fields and uploaded files.
 */
async function parseFormData(req) {
  const form = formidable({ keepExtensions: true });

  const headers = {};
  for (const [key, value] of req.headers.entries()) {
    headers[key.toLowerCase()] = value;
  }

  const buffer = Buffer.from(await req.arrayBuffer());

  const stream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });

  const fakeReq = Object.assign(stream, {
    headers,
    method: req.method
  });

  return new Promise((resolve, reject) => {
    form.parse(fakeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

/**
 * Handles POST requests to the chatbot API.
 * Parses the form input, reads and parses an optional PDF file,
 * and sends the combined user input and PDF content to the Bedrock AI model.
 *
 * @param {Request} req - The incoming Next.js API POST request.
 * @returns {Promise<Response>} - The HTTP response containing AI output or error.
 */
export async function POST(req) {
  try {
    const { fields, files } = await parseFormData(req);
    // 'fields' contains userPrompt, 'files' may contain a file upload

    const userPrompt = fields.userPrompt?.[0] || '';

    const uploadedFiles = Array.isArray(files.files)
    ? files.files
    : files.files ? [files.files] : [];

    let allFileText = '';

    for (const file of uploadedFiles) {
    try {
        const buffer = await fs.readFile(file.filepath);

        if (file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(buffer);
        allFileText += `\n\n[PDF: ${file.originalFilename}]\n` + parsed.text;
        } else if (
        file.mimetype === 'text/plain' ||
        file.mimetype === 'text/markdown' ||
        file.originalFilename.endsWith('.md')
        ) {
        const text = buffer.toString('utf-8');
        allFileText += `\n\n[Text: ${file.originalFilename}]\n` + text;
        } else {
        console.warn('Unsupported file type:', file.mimetype);
        }
    } catch (err) {
        console.error(`Failed to read file ${file.originalFilename}:`, err);
    }
    }
    console.log('Received fields:', fields);
    console.log('Received files:', files);  

    // Send prompt and optional files to Bedrock AI
    const { raw, message } = await invokeBedrock(userPrompt, allFileText);

    return new Response(JSON.stringify({ response: message, debug: raw }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
