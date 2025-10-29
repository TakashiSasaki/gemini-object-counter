
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel, CountResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Strips the base64 prefix from a data URI.
 * e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." -> "/9j/4AAQSkZJRgABAQ..."
 */
const stripBase64Prefix = (dataUri: string): string => {
  return dataUri.substring(dataUri.indexOf(',') + 1);
};

/**
 * Calls the Gemini API to count objects in an image.
 * @param imageUri The base64 data URI of the image.
 * @param labels An array of object labels to count. If empty, the model will detect all objects.
 * @param model The Gemini model to use for the analysis.
 * @returns A promise that resolves to an array of CountResult.
 */
export const countObjectsInImage = async (
  imageUri: string,
  labels: string[],
  model: GeminiModel
): Promise<CountResult[]> => {
  try {
    const base64Data = stripBase64Prefix(imageUri);
    const mimeType = imageUri.substring(5, imageUri.indexOf(';'));

    if (!mimeType.startsWith('image/')) {
      throw new Error('Invalid image MIME type');
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    let prompt: string;
    if (labels.length > 0) {
      prompt = `Analyze the image and count the occurrences of the following objects: ${labels.join(', ')}.`;
    } else {
      prompt = `Analyze the image and identify all distinct objects. For each object type you identify, provide its name and the total count of its occurrences in the image. Return an empty array if no objects are found.`;
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, {text: prompt}] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    counts: {
                        type: Type.ARRAY,
                        description: 'An array of objects, where each object contains a label and its count.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: {
                                    type: Type.STRING,
                                    description: 'The name of the object being counted.'
                                },
                                count: {
                                    type: Type.INTEGER,
                                    description: 'The number of times the object appears in the image. Should be 0 if not found.'
                                }
                            },
                            required: ['label', 'count']
                        }
                    }
                },
                required: ['counts']
            }
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.counts)) {
      return result.counts;
    } else {
      throw new Error("Invalid response format from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the image.");
  }
};