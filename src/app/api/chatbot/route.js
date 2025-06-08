/** 
 * API backend for processing user inputs and recieving index.js output
 */

import formidable from 'formidable';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';
import { invokeBedrock } from '../../../lib/index.js';

// Prevent automatic parsing of multipart data
export const config = {
  api: { bodyParser: false }
};

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

  // Create a fake Node.js-style request object for formidable
  const fakeReq = Object.assign(stream, {
    headers,
    method: req.method
  });

  // Parse the form data
  return new Promise((resolve, reject) => {
    form.parse(fakeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req) {
  try {
    const { fields, files } = await parseFormData(req);
    // fields contain userinput, files contain uploaded files

    const userPrompt = fields.userPrompt?.[0] || '';
    let pdfText = '';

    if (files.file?.[0]) {
      try {
        const buffer = await fs.readFile(files.file[0].filepath);
        const parsed = await pdfParse(buffer);
        pdfText = parsed.text;
      } catch (err) {
        console.error('PDF parse error:', err);
      }
    }

    const reply = await invokeBedrock(userPrompt, pdfText);

    return new Response(JSON.stringify({ response: reply }), { // this will return the 'response' portion of the JSON data
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
