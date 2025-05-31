const cacheVideo = async (videoUrl) => {
  const cache = await caches.open('offline-videos');
  await cache.add(videoUrl);
  const response = await cache.match(videoUrl);
  const blob = await response.blob();
  localStorage.setItem(videoUrl, URL.createObjectURL(blob));
};
const playOfflineVideo = (videoId) => {
  const videoBlob = localStorage.getItem(videoId);
  return (
    <video controls>
      <source src={videoBlob} type="video/mp4" />
    </video>
  );
};