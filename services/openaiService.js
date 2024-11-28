const axios = require('axios');

async function processBirdImage(base64Image) {
  try {
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Isto é uma foto de um passáro, identifique qual ave é e me responda apenas a raça da ave. Exemplo, bem-te-vi.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const birdName = openAiResponse.data.choices[0].message.content.trim();
    return birdName;
  } catch (error) {
    throw new Error('Erro ao processar a imagem com a OpenAI: ' + error.message);
  }
}

module.exports = { processBirdImage };
