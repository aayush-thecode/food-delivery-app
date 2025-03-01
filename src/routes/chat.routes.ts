import { Router, Request, Response } from 'express';
import { Together } from 'together-ai';
import { CustomError } from '../middleware/errorhandeler.middleware';

const router = Router();

// Initialize Together API
const together = new Together({
    apiKey: process.env.TOGETHER_AI_API_KEY as string, // Ensure you have this in your .env file
});

// Chatbot route
router.post("/", async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            throw new CustomError('something went wrong',404);
        }

        const response = await together.chat.completions.create({
            messages: [{ role: 'user', content: message }],
            model: "mistralai/Mistral-7B-Instruct-v0.1", // Corrected model name.  CHANGE THIS IF NEEDED.
        });

        // Add null/undefined checks and handle potential errors
        if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
           res.json({ response: response.choices[0].message.content });
        } else {
            res.status(500).json({ error: "Unexpected response format from Together AI" });
        }

    } catch (error) {
        console.error("Error fetching chatbot response:", error);
        // Provide more detailed error information in the response, if possible
        if (error instanceof Error) { // Check if it's a standard Error object
          res.status(500).json({ error: "Internal Server Error", details: error.message, stack: error.stack });
        } else {
          res.status(500).json({ error: "Internal Server Error", details: String(error) }); // Fallback for non-Error objects
        }

    }
});

export default router;