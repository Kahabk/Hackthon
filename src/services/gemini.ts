import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAgroReport(data: any) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an advanced AI system specialized in Satellite image analysis, LULC classification, Soil science, and Fertilizer interaction.
    
    Analyze the following geographic region:
    
    LOCATION:
    - Latitude: ${data.location.lat}
    - Longitude: ${data.location.lng}
    - Address: ${data.location.address}

    SATELLITE INDICATORS (Estimated):
    - Vegetation density: ${data.satellite.vegetation}%
    - Water presence: ${data.satellite.water}%
    - Soil exposure: ${data.satellite.soil}%
    - Urban presence: ${data.satellite.urban}%
    ${data.area ? `- Selected Farm Area: ${(data.area / 10000).toFixed(2)} hectares` : ''}

    SOIL DATA:
    - Nitrogen (N): ${data.soil.n}
    - Phosphorus (P): ${data.soil.p}
    - Potassium (K): ${data.soil.k}
    - pH: ${data.soil.ph}

    CROP: ${data.soil.crop}
    FERTILIZER: ${data.soil.fertilizer}

    WEATHER:
    - Temperature: ${data.weather.temp}°C
    - Humidity: ${data.weather.humidity}%
    - Rainfall: ${data.weather.rainfall}mm

    OUTPUT REQUIRED (JSON format):
    1. LAND CLASSIFICATION: Estimate percentage distribution (Agriculture, Forest, Water, Urban, Bare Soil).
    2. SOIL + FERTILIZER ANALYSIS: Nutrient balance, effectiveness, and possible losses.
    3. PREDICTIONS: Yield Prediction (%), Risk Score (%), Nutrient Efficiency (%).
    4. SEASONAL SUITABILITY: Detailed explanation of which months/seasons are best for this soil and crop combination.
    5. EXPLANATION: How land type affects farming, soil+fertilizer interaction, and weather impact.
    6. RECOMMENDATIONS: Better fertilizer, soil improvements, and farming adjustments.

    Return the response as a structured JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            landClassification: {
              type: Type.OBJECT,
              properties: {
                agriculture: { type: Type.NUMBER },
                forest: { type: Type.NUMBER },
                water: { type: Type.NUMBER },
                urban: { type: Type.NUMBER },
                bareSoil: { type: Type.NUMBER }
              }
            },
            soilAnalysis: {
              type: Type.OBJECT,
              properties: {
                nutrientBalance: { type: Type.STRING },
                effectiveness: { type: Type.STRING },
                losses: { type: Type.STRING }
              }
            },
            predictions: {
              type: Type.OBJECT,
              properties: {
                yield: { type: Type.NUMBER },
                risk: { type: Type.NUMBER },
                efficiency: { type: Type.NUMBER }
              }
            },
            seasonalSuitability: {
              type: Type.OBJECT,
              properties: {
                bestTime: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                monthlyOutlook: { type: Type.STRING }
              }
            },
            explanation: {
              type: Type.OBJECT,
              properties: {
                landImpact: { type: Type.STRING },
                interaction: { type: Type.STRING },
                weatherImpact: { type: Type.STRING }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING }
          },
          required: ["landClassification", "soilAnalysis", "predictions", "seasonalSuitability", "explanation", "recommendations", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function generateSatelliteImage(data: any) {
  const model = "gemini-2.5-flash-image";
  
  const prompt = `
    A high-resolution satellite view of a farm at ${data.location.address}. 
    The area is approximately ${data.ai.landClassification.agriculture}% agricultural land, ${data.ai.landClassification.forest}% forest, and ${data.ai.landClassification.water}% water.
    The crop being grown is ${data.soil.crop}. 
    The image should look like a professional agricultural monitoring satellite view with vibrant greens for healthy vegetation and clear field boundaries. 
    Cinematic lighting, 4k resolution, highly detailed terrain.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}
