function extractPublicIdFromUrl(url) {
    try {
        const regex = /\/v\d+\/(.+?)(\.[^.]+)?$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
}

module.exports = extractPublicIdFromUrl;