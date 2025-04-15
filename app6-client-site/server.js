const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve site-template.html for root path
  const filePath = req.url === '/' 
    ? path.join(__dirname, 'site-template.html')
    : path.join(__dirname, req.url);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    // Add cache control headers to prevent caching
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content, 'utf-8');
  });
});

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
