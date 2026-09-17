// Extracts the 11-character YouTube video ID from any common URL shape an
// instructor might paste in: watch?v=, youtu.be/, embed/, or shorts/.
// Returns null if the string doesn't look like a YouTube link at all, so
// the controller can reject it with a clear error instead of saving junk.
function extractYoutubeId(url) {
  if (!url || typeof url !== "string") return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

const youtubeThumbnail = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const youtubeEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}`;

module.exports = { extractYoutubeId, youtubeThumbnail, youtubeEmbedUrl };