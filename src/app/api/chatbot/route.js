import formidable from 'formidable';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';
import { invokeBedrock } from '../../../lib/index.js';

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

  // Create a fake Node.js-style request object
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

export async function POST(req) {
  try {
    const { fields, files } = await parseFormData(req);

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

    return new Response(JSON.stringify({ response: reply }), {
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
