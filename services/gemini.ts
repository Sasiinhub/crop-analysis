import { GoogleGenAI, Type } from "@google/genai";
import { CropData, AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCropData = async (data: CropData[]): Promise<AnalysisResult> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  // Convert data to a readable string format
  const dataString = JSON.stringify(data.map(({ id, ...rest }) => rest), null, 2);

  const prompt = `
    You are an AI acting as an advanced Agricultural Machine Learning Model.
    Analyze the following crop dataset which contains Production Costs (Seeds, Fertilizer, Labor etc.) and Profit margins.
    
    Dataset:
    ${dataString}

    Your Task:
    1. Compare the Profit vs Cost ratios. Identify which crops are underperforming.
    2. Suggest specific "Logic" or agricultural techniques (e.g., precision farming, crop rotation, specific fertilizer mixes) to enhance the yield and profit of the lower performing crops.
    3. Provide a profitability analysis score based on the data.
    
    Return the response in this JSON structure:
    {
      "summary": "Brief analysis of the profit/cost trends.",
      "recommendations": ["ML Logic/Enhancement 1", "ML Logic/Enhancement 2", "ML Logic/Enhancement 3"],
      "profitabilityScore": 85 (0-100 score)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            profitabilityScore: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};