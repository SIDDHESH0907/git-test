const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const mysql = require("mysql2/promise");

const zipFilePath = "D:/Temp/pdf.zip";

// Extract PDFs from the zip file
const zip = new AdmZip(zipFilePath);
const zipEntries = zip.getEntries();

// Helper function to execute MySQL queries
async function executeQuery(connection, query, params) {
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error("MySQL Query Error:", error.message);
    throw error;
  }
}

// Upload each PDF to MySQL separately
async function uploadToMySQL() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mock_db",
    port: 3307,
  });

  // Iterate through each entry in the zip file
  for (const entry of zipEntries) {
    if (entry.entryName.endsWith(".pdf")) {
      // Read the PDF buffer and extract document details
      const pdfBuffer = zip.readFile(entry.entryName);
      const documentName = path.basename(entry.entryName, ".pdf");

      // Extract parts from the filename
      const fileNameParts = documentName.split("_");
      if (fileNameParts.length === 2) {
        const panNo = fileNameParts[0] || null;

        // Extract quarter and year from the second part using regex
        const match = fileNameParts[1].match(/(\d{2})-(\d{4})-(\d{2})/);
        const quarter = match ? match[1] : null;
        const year = match ? match[2] : null;

        console.log(
          `Document Name: ${documentName}, PAN No: ${panNo}, Quarter: ${quarter}, Year: ${year}`
        );

        // Insert the PDF data into the MySQL database
        const query =
          "INSERT INTO pdf_upload (document_name, pan_no, quarter, year, pdf_data) VALUES (?, ?, ?, ?, ?)";
        await executeQuery(connection, query, [
          documentName,
          panNo,
          quarter,
          year,
          pdfBuffer,
        ]);

        console.log(`PDF "${documentName}" uploaded to MySQL successfully`);
      } else {
        console.error(`Invalid document name format: ${documentName}`);
      }
    }
  }

  // Close the MySQL connection
  await connection.end();
}

// Call the uploadToMySQL function
uploadToMySQL();
