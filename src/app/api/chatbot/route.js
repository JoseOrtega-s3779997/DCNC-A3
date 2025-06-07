import { invokeBedrock } from '../../../lib/index.js';

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