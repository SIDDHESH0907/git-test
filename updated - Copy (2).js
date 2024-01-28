const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const mysql = require("mysql2/promise");

const zipFilePath = "D:/Temp/pdf.zip";

// Extract PDFs from the zip file
const zip = new AdmZip(zipFilePath);
const zipEntries = zip.getEntries();

// Upload each PDF to MySQL separately
async function uploadToMySQL() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mock_db",
    port: 3307,
  });

  for (const entry of zipEntries) {
    if (entry.entryName.endsWith(".pdf")) {
      const pdfBuffer = zip.readFile(entry.entryName);
      const documentName = path.basename(entry.entryName, ".pdf");

      // Extract parts from the filename
      const parts = documentName.split("_")[0].split("-");
      const panNo = parts[0] || null;
      const quarter = parts[1] || null;
      const year = parts[2] || null;

      console.log(`Parts: ${parts}`);
      console.log(
        `Document Name: ${documentName}, PAN No: ${panNo}, Quarter: ${quarter}, Year: ${year}`
      );

      const query =
        "INSERT INTO pdf_upload (document_name, pan_no, quarter, year, pdf_data) VALUES (?, ?, ?, ?, ?)";
      await connection.execute(query, [
        documentName,
        panNo,
        quarter,
        year,
        pdfBuffer,
      ]);

      console.log(`PDF "${documentName}" uploaded to MySQL successfully`);
    }
  }

  // Close the MySQL connection
  await connection.end();
}

// Call the uploadToMySQL function
uploadToMySQL();
