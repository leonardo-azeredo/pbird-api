const fs = require('fs');
const path = require('path');

async function saveImageLocally(base64Image, birdName) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${birdName}-${timestamp}.jpg`;
    const filePath = path.join(__dirname, '../temp', fileName);

    // Certifique-se de que o diretório 'temp' existe
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'));
    }

    // Decodificar a imagem base64 e salvá-la
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    return filePath;
  } catch (error) {
    throw new Error('Erro ao salvar a imagem localmente: ' + error.message);
  }
}

module.exports = { saveImageLocally };
