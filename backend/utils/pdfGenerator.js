const PDFDocument = require('pdfkit');
const fs = require('fs');
module.exports = (name, courseTitle)=>{
  const file = `certificates/${name}-${Date.now()}.pdf`;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(file));
  doc.fontSize(30).text('SERTIFIKAT', { align:'center' });
  doc.moveDown().fontSize(18).text(`Diberikan kepada ${name}`,{align:'center'});
  doc.moveDown().text(`Course: ${courseTitle}`,{align:'center'});
  doc.end();
  return file;
};