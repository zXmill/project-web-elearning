const generateCertificate = (userName, score) => {
  const doc = new PDFDocument();
  doc.image('cert-template.png', 0, 0, { width: 612 });
  doc.fontSize(24)
     .text('Sertifikat Kompetensi', 50, 150)
     .fontSize(18)
     .text(`Nama: ${userName}`, 50, 200)
     .text(`Skor: ${score}`, 50, 230)
     .text('Telah menyelesaikan pelatihan Sports Massage', 50, 260);
  return doc;
};