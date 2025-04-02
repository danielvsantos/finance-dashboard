import OpenAI from 'openai';
import { getToken } from 'next-auth/jwt';
import { StatusCodes } from 'http-status-codes';
import * as Sentry from '@sentry/nextjs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export default async function handler(req, res) {
  try {
    const session = await getToken({ req });
    if (!session) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'POST':
        return await handlePost(req, res, session);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(StatusCodes.METHOD_NOT_ALLOWED).end();
    }
  } catch (error) {
    Sentry.captureException(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
}

async function handlePost(req, res, session) {
  try {
    const { threadId: incomingThreadId, message } = req.body;

    let threadId = typeof incomingThreadId === 'string' ? incomingThreadId : null;

    // Step 1: Create thread if none exists
    if (!threadId) {
      const newThread = await openai.beta.threads.create();
      threadId = newThread.id;
    }

    // Step 2: Add user message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log("Thread ID:", threadId);
      console.log("User message:", message);
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid message. Please provide a non-empty string.',
      });
    }
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Step 3: Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
      tool_choice: "auto",
    });

    // Step 4: Poll for completion
    let completedRun;
    while (true) {
      completedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (completedRun.status === 'completed') break;
      if (['failed', 'cancelled', 'expired'].includes(completedRun.status)) {
        throw new Error(`Run ${completedRun.status}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 5: Get assistant reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const reply = messages.data.find(msg => msg.role === 'assistant')?.content[0]?.text?.value;

    return res.status(StatusCodes.OK).json({ reply, threadId });
  } catch (error) {
    console.error('OpenAI Assistant error:', error);
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Failed to generate assistant response',
      details: error.message,
    });
  }
}
