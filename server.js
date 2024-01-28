const fs = require('fs');
const AdmZip = require('adm-zip');
const mysql = require('mysql2/promise');

const zipFilePath = 'D:/Temp/pdf.zip';

// Extract PDFs from the zip file
const zip = new AdmZip(zipFilePath);
const zipEntries = zip.getEntries();

// Upload each PDF to MySQL separately
async function uploadToMySQL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mock_db',
  });

  for (const entry of zipEntries) {
    if (entry.entryName.endsWith('.pdf')) {
      const pdfBuffer = zip.readFile(entry.entryName);

      const query = 'INSERT INTO pdf_upload (pdf_data) VALUES (?)';
      await connection.execute(query, [pdfBuffer]);

      console.log(`PDF "${entry.entryName}" uploaded to MySQL successfully`);
    }
  }

  // Close the MySQL connection
  await connection.end();
}

// Call the uploadToMySQL function
uploadToMySQL();
