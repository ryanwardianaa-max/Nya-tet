const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const apiKey = 'AIzaSyB7vVKV5n1kuVLjoP0qqlT-E6W8fRytKnU\n';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent("Halo, siapa nama kamu?");

    console.log("SUCCESS:", result.response.text());
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

main();
