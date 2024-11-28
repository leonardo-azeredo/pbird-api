const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const GOOGLE_API_FOLDER_ID = '1WbeHEXyj0ga5OicDqXogCEwHgcF7R85o';

async function saveImageToDrive(filePath, fileName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './googlekey.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const driveService = google.drive({
      version: 'v3',
      auth,
    });

    const fileMetaData = {
      name: fileName,
      parents: [GOOGLE_API_FOLDER_ID],
    };

    const media = {
      mimeType: 'image/jpg',
      body: fs.createReadStream(filePath),
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    return response.data.id;
  } catch (err) {
    throw new Error('Erro ao fazer upload para o Google Drive: ' + err.message);
  }
}

module.exports = { saveImageToDrive };
