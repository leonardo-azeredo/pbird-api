const { processBirdImage } = require('../services/openaiService');
const { saveImageToDrive } = require('../services/googleDriveService');
const { saveImageLocally } = require('../utils/imageUtils');

async function identifyBird(req, res) {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
  }

  try {
    // Passo 1: Enviar para a OpenAI
    const birdName = await processBirdImage(base64Image);

    // Passo 2: Salvar a imagem localmente
    const filePath = await saveImageLocally(base64Image, birdName);

    // Passo 3: Fazer upload para o Google Drive
    const fileId = await saveImageToDrive(filePath, birdName);

    // Resposta ao cliente com o ID do arquivo no Google Drive
    res.json({
      message: 'Imagem salva e enviada para o Google Drive com sucesso!',
      birdName,
      googleDriveFileId: fileId,
    });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: 'Erro ao processar a imagem.' });
  }
}

module.exports = { identifyBird };
