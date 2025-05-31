const generate = require('../utils/pdfGenerator');

exports.issue = async (req,res)=>{
  const { name, courseTitle } = req.body;
  const path = generate(name, courseTitle);
  res.download(path);
};