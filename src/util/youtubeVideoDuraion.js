const getVideoDuration = async (videoId) => {
    if (!videoId) return 0;

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${process.env.YOUTUBE_API_KEY}`);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('No video data found');
            return 0;
        }

        const duration = data.items[0].contentDetails.duration;
        return convertDuration(duration);
    } catch (error) {
        console.error('Error getting video duration:', error);
        return 0;
    }
}

function convertDuration(isoDuration) {
    let match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    let hours = match[1] ? parseInt(match[1]) : 0;
    let minutes = match[2] ? parseInt(match[2]) : 0;
    let seconds = match[3] ? parseInt(match[3]) : 0;

    // Nếu có giờ thì hiển thị dạng HH:MM:SS, còn không thì hiển thị MM:SS
    return hours > 0
        ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

module.exports = { getVideoDuration };