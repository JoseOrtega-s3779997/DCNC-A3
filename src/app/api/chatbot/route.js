import { invokeBedrock } from '../../lib/index.js';
export default async function AWShandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
    }

    const { userPrompt } = req.body;

    if (!userPrompt) {
        return res.status(400).json({ error: 'Missing user prompt' });
    }
    
    try {
        const reply = await invokeBedrock(userPrompt);
        res.status(200).json({ response: reply });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}