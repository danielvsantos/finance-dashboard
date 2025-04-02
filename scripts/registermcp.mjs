import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mcpServer = await openai.beta.mcp_servers.create({
  url: "http://localhost:7777", // Change if deploying
  name: "Local BLISS MCP Server",
});

console.log("✅ MCP Server registered:", mcpServer);
