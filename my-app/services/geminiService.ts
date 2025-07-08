
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ReceiptData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function fileToGenerativePart(base64: string) {
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
}

export async function extractReceiptData(base64Image: string): Promise<ReceiptData> {
  const imagePart = fileToGenerativePart(base64Image);
  const prompt = `
    Analyze the provided receipt image and extract the following information in JSON format:
    - vendor: The name of the store or service provider.
    - date: The date of the transaction in YYYY-MM-DD format.
    - total: The total amount of the bill as a number.
    - items: An array of objects, where each object has 'description' (string) and 'amount' (number) for each line item. If line items are not clear, provide an empty array.

    Only return a valid JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
        },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // Basic validation
    if (!parsedData.vendor || !parsedData.date || typeof parsedData.total !== 'number') {
        throw new Error("Extracted data is missing required fields.");
    }

    return {
        vendor: parsedData.vendor,
        date: parsedData.date,
        total: parsedData.total,
        items: parsedData.items || [],
    };
  } catch (error) {
    console.error("Error processing receipt with Gemini:", error);
    throw new Error("Could not analyze the receipt. The AI model might be unavailable or the image may be unreadable.");
  }
}
