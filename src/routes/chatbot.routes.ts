import { Router, Request, Response, NextFunction } from 'express';
import { Together } from 'together-ai';
import { CustomError } from '../middleware/errorhandeler.middleware';

const router = Router();

// Initialize Together API

const together = new Together({
    apiKey: process.env.TOGETHER_AI_API_KEY as string, 
});

// Helper function to fetch chat responses
async function getChatResponse(prompt: string): Promise<string | undefined> {
  try {
    const response = await together.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    });

    response?.choices?.[0]?.message?.content;
    
  } catch (error) {
    console.error("Error fetching response:", error);
    return undefined;
  }
}

// Chatbot route
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message) {
      throw new CustomError('Message is required', 400);
    }

    const chatResponse = await getChatResponse(message);

    if (chatResponse) {
      res.json({ response: chatResponse });
    } else {
      throw new CustomError('Failed to get a response from the AI model', 500);
    }
  } catch (error) {
    next(error);
  }
});

// Handle undefined routes
router.all('*', (req: Request, res: Response, next: NextFunction) => {
  const message = `Cannot ${req.method} on ${req.originalUrl}`;
  next(new CustomError(message, 404));
});

// Global error handler
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong!';
  const status = error.status || 'error';

  res.status(statusCode).json({
    status,
    success: false,
    message,
    details: error.stack || null,
  });
});

export default router;
