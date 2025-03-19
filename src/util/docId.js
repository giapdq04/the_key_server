function getDocId(url) {
    if (!url) return null;
    
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

module.exports = { getDocId }