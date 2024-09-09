import fs from "fs";
import PDFDocument from "pdfkit";

function createPdf(randomCodes, pdfPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    doc.fontSize(12).text("Codes:", { underline: true }).moveDown();
    randomCodes.forEach((code) => {
      doc.text(code);
    });

    doc.end();

    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}
