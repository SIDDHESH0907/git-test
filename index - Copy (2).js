const fs = require('fs');
const path = require('path');
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
    password: '',  // Leave it empty for XAMPP, or use your XAMPP MySQL password
    database: 'mock_db',
    port: 3307,     // Default MySQL port used by XAMPP
  });

  for (const entry of zipEntries) {
    if (entry.entryName.endsWith('.pdf')) {
      const pdfBuffer = zip.readFile(entry.entryName);
      const pdfName = path.basename(entry.entryName, '.pdf'); // Extracts filename without extension

      const query = 'INSERT INTO pdf_upload (pdf_name, pdf_data) VALUES (?, ?)';
      await connection.execute(query, [pdfName, pdfBuffer]);

      console.log(`File "${pdfName}" uploaded to MySQL successfully`);
    }
  }

  // Close the MySQL connection
  await connection.end();
}

// Call the uploadToMySQL function
uploadToMySQL();
