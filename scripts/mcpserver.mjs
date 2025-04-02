import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ReadResourceRequestSchema, ListResourcesRequestSchema, CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Initialize MCP server with declared capabilities
const server = new Server(
  { name: "Finance MCP", 
    version: "1.0.0" 
  },
  {
    capabilities: { 
      resources: {}, 
      tools: {},
     },
    instructions: "This server provides access to transaction data and financial tools."
  }
);

// List available resources dynamically
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.error("📡 Received request: list resources");
  // Example for two months — this could be expanded based on needs
  return {
    resources: [
      {
        uri: "file:///transactions/2025/03",
        name: "March 2025 Transactions",
        mimeType: "application/json"
      },
      {
        uri: "file:///transactions/2025/04",
        name: "April 2025 Transactions",
        mimeType: "application/json"
      }
    ]
  };
});

// Read dynamic transaction data
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.error("📥 Received request: read resource", request.params.uri);
  const uri = request.params.uri;
  const match = uri.match(/^file:\/\/\/transactions\/(\d{4})\/(\d{2})$/);
  if (!match) throw new Error(`Invalid URI format: ${uri}`);

  const [_, year, month] = match;
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?year=${year}&month=${month}`;
  const secret = process.env.NEXT_PUBLIC_API_SECRET;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json"
      }
    });

    const body = await response.text();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: body
        }
      ]
    };
  } catch (err) {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ error: err.message, uri })
        }
      ]
    };
  }
});

// List available tools dynamically
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("📡 Received request: list tools")
  return {
    tools: [
      {
        name: "save-transactions",
        description: "Save a single transaction to the finance backend.",
        inputSchema: {
          type: "object",
          properties: {
            transaction_date: { type: "string" },
            account_id: { type: "number" },
            category_id: { type: "number" },
            description: { type: "string" },
            details: { type: "string" },
            credit: { type: "number" },
            debit: { type: "number" },
            currency: { type: "string" },
            transfer: { type: "boolean" },
            numOfShares: { type: "number" },
            price: { type: "number" },
            ticker: { type: "string" }
          },
          required: [
            "transaction_date",
            "account_id",
            "category_id",
            "description",
            "details",
            "currency"
          ]
        }
      }
    ]
  };
});

// Tool to save transaction data
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error("📥 Received request: call tool", request.params.uri);
  const { name, arguments: args } = request.params;


  if (name === "save-transactions") {
    try {

      const transactionWithUser = {
        ...args,
        userId: `mcp-server`
      };
      

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
        },
        body: JSON.stringify(transactionWithUser)
      });

      const result = await response.json();
      return {
        result: {
          type: "text",
          text: `Successfully saved transactions: ${JSON.stringify(result)}`
        }
      };
    } catch (err) {
      return {
        result: {
          type: "text",
          text: `Failed to save transactions: ${err.message}`
        }
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});
// Start the server
async function runServer() {
  const transport = new StdioServerTransport();

  transport.onerror = (err) => {
    console.error("❌ MCP transport error:", err);
  };

  try {
    await server.connect(transport);
    console.error("✅ MCP Server is running and awaiting messages");
  } catch (error) {
    console.error("🚨 Failed to start MCP server:", error);
    process.exit(1);
  }
}

runServer();


// // Global error handlers for visibility
// process.on('uncaughtException', (err) => {
//   console.error("🔥 Uncaught Exception:", err);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error("🔥 Unhandled Rejection at:", promise, "reason:", reason);
//   process.exit(1);
// });

