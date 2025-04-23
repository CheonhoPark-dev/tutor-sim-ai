import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function getGeminiResponse(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in Gemini API call:', error);
    throw error;
  }
}

export async function getGeminiVisionResponse(prompt: string, imageUrl: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Fetch the image and convert it to base64
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const imageData = {
            inlineData: {
              data: base64data.split(',')[1],
              mimeType: 'image/jpeg'
            }
          };

          const result = await model.generateContent([prompt, imageData]);
          const response = await result.response;
          resolve(response.text());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(imageBlob);
    });
  } catch (error) {
    console.error('Error in Gemini Vision API call:', error);
    throw error;
  }
}
