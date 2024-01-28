// Include necessary libraries
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

// Set the path to the zip file
const zipFilePath = "D:/Temp/pdf.zip";

// Extract PDFs from the zip file
const zip = new AdmZip(zipFilePath);
const zipEntries = zip.getEntries();

// ...

// Upload each PDF to MySQL separately
async function uploadToMySQL(connection) { // Pass connection as a parameter
  // ...

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
  await endConnection(connection);
}

// Dummy functions for demonstration purposes
function createConnection(config) {
  // Replace this with actual implementation
  console.log("Creating MySQL connection...");
}

async function executeQuery(connection, query, params) {
  // Replace this with actual implementation
  console.log("Executing query...");
}

async function endConnection(connection) {
  // Replace this with actual implementation
  console.log("Closing MySQL connection...");
}

// Create a MySQL connection
const connection = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mock_db",
  port: 3307,
});

// Call the uploadToMySQL function with the connection
uploadToMySQL(connection);
