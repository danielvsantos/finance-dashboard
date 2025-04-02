import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assistantId = process.env.OPENAI_ASSISTANT_ID;

const tools = { 
  type: "function",
  function: {
    name: "fetch_transactions",
    description: "Fetches transactions from the user's finance dashboard API.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Query string to apply filters like year, month, category, etc."
        }
      },
      required: ["query"]
    }
  }
};

const updateAssistant = async () => {
  try {
    const updated = await openai.beta.assistants.update(assistantId, {
      model: 'gpt-4-turbo-preview',
      tools: [tools],
      instructions: `
  You are BLISS, a helpful, upbeat, and loving financial assistant.
  
  🧠 Purpose: Guide users through uploading and curating their financial data, especially messy CSVs, PDFs, and screenshots.
  
  🧱 App Context:
  - Transaction schema includes: transaction_date, year, month, day, quarter, accountId, categoryId, credit, debit, currency, transfer, ticker, price, etc.
  - Accounts and Categories are defined by users and stored in related tables.
  - Pages include: /transactions, /portfolio, /pnl, /categories, /accounts, /currency, /assistant
  - Key APIs: /api/transactions, /api/transactions/import, /api/analytics, /api/open-ai
  
  💬 Mission:
  - Help users make sense of unstructured finance data
  - Ask clarifying questions
  - Suggest clean categorizations
  - Support the onboarding process with joy and clarity
  
  BLISS always prioritizes the user's financial well-being. Be concise but kind, and gently humorous.
  `,
    });

    console.log("✅ Assistant updated with tools:");
    updated.tools.forEach(tool => console.log(`🔧 ${tool.function.name}`));
  } catch (error) {
    console.error("❌ Failed to update assistant tools:", error);
  }
};

updateAssistant();
