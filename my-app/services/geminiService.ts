
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

export interface ReceiptAnalysisResult {
  receiptData: ReceiptData;
  fraudIndicators: FraudIndicator[];
  authenticityScore: number;
  recommendations: string[];
}

export interface FraudIndicator {
  type: 'suspicious_pattern' | 'image_manipulation' | 'duplicate_receipt' | 'unusual_amount' | 'vendor_mismatch';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
}

export async function analyzeReceiptForFraud(base64Image: string): Promise<ReceiptAnalysisResult> {
  const imagePart = fileToGenerativePart(base64Image);
  
  const fraudDetectionPrompt = `
    วิเคราะห์รูปภาพใบเสร็จนี้เพื่อหาตัวบ่งชี้การฉ้อโกงที่อาจเกิดขึ้น กลับมาเป็น JSON object ที่มี:
    
    {
      "receiptData": {
        "vendor": "ชื่อร้านค้า",
        "date": "YYYY-MM-DD",
        "total": number,
        "items": [{"description": "string", "amount": number}]
      },
      "fraudIndicators": [
        {
          "type": "suspicious_pattern|image_manipulation|duplicate_receipt|unusual_amount|vendor_mismatch",
          "severity": "low|medium|high",
          "description": "คำอธิบายโดยละเอียด",
          "confidence": 0.0-1.0
        }
      ],
      "authenticityScore": 0.0-1.0,
      "recommendations": ["ข้อเสนอแนะสำหรับฝ่ายบุคคล"]
    }
    
    ตรวจสอบ:
    1. สัญญาณการแก้ไขรูปภาพ (เบลอ, ข้อบกพร่อง, แสงไม่สม่ำเสมอ)
    2. รูปแบบที่น่าสงสัย (จำนวนเงินกลม, จำนวนเงินผิดปกติ)
    3. ความไม่สอดคล้องของชื่อร้านค้า
    4. ความผิดปกติของวันที่ (วันที่ในอนาคต, วันที่เก่าเกินไป)
    5. ความไม่สอดคล้องของรูปแบบใบเสร็จ
    6. องค์ประกอบใบเสร็จที่ขาดหายไปหรือไม่ชัดเจน
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [imagePart, { text: fraudDetectionPrompt }] },
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text?.trim() || '';
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsedData.receiptData || !parsedData.fraudIndicators || typeof parsedData.authenticityScore !== 'number') {
      throw new Error("Invalid analysis result structure");
    }

    return {
      receiptData: parsedData.receiptData,
      fraudIndicators: parsedData.fraudIndicators || [],
      authenticityScore: Math.max(0, Math.min(1, parsedData.authenticityScore)),
      recommendations: parsedData.recommendations || []
    };
  } catch (error) {
    console.error("Error analyzing receipt for fraud:", error);
    throw new Error("ไม่สามารถวิเคราะห์ใบเสร็จเพื่อตรวจสอบการฉ้อโกงได้");
  }
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

    let jsonStr = response.text?.trim() || '';
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
