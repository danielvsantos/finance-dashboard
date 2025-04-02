import OpenAI from "openai";
const client = new OpenAI();

const assistantId = process.env.OPENAI_ASSISTANT_ID;

const response = await client.responses.create({
    model: "gpt-4o",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);