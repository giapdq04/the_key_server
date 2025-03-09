function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^&?/]+)/;
    const match = url.trim().match(regex);
    return match ? match[1] : null;
}

module.exports = { getYouTubeVideoId }