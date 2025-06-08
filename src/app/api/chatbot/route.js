/**
 * This is an API endpoint where the user page (HTML) will send a request to communicate with index.js
 * The API will then pass the response back to the user.
 */
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { invokeBedrock } from '../../../lib/index.js'; // Invoke the index.js file (Adjust when moving the file)

export const config = {
  api: { bodyParser: false } // Required for file upload
};

export async function POST(req) {
    try {
        const body = await req.json(); // must await JSON from Request object
        const { userPrompt } = body;

        if (!userPrompt) {
            return new Response(JSON.stringify({ error: 'Missing user prompt' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const reply = await invokeBedrock(userPrompt);
        return new Response(JSON.stringify({ response: reply }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}