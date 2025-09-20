// CloudFront Function to handle Next.js static export routing
// This function rewrites directory requests to index.html files

function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check if the URI ends with a slash (directory request)
    if (uri.endsWith('/')) {
        // Append index.html to directory requests
        request.uri = uri + 'index.html';
    }
    // Check if the URI doesn't have a file extension and doesn't end with .html
    else if (!uri.includes('.') && !uri.endsWith('.html')) {
        // For routes like /login, append /index.html
        request.uri = uri + '/index.html';
    }
    
    return request;
}
