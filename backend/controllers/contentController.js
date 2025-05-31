const handleVideoUpload = async (req, res) => {
  const { bodyPart, technique } = req.body;
  const videoFile = await compressVideo(req.file); // FFmpeg compression
  const video = new Video({
    title: `Teknik ${technique} untuk ${bodyPart}`,
    url: videoFile.path,
    description: req.body.description,
    category: bodyPart,
    technique
  });
  await video.save();
  res.status(201).json(video);
};