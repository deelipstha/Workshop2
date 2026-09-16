const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    try {

        // Task 6 - Bonus API
        if (req.url === '/api/time' && req.method === 'GET') {
            const currentDateTime = new Date().toISOString();

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                datetime: currentDateTime,
                timestamp: Date.now()
            }));

            return;
        }

        // Task 2 - Routing
        let filePath;

        if (req.url === '/') {
            filePath = path.join(PUBLIC_DIR, 'index.html');

        } else if (req.url === '/about') {
            filePath = path.join(PUBLIC_DIR, 'about.html');

        } else if (req.url === '/contact') {
            filePath = path.join(PUBLIC_DIR, 'contact.html');

            // Task 4 - CSS
        } else if (req.url.startsWith('/styles/')) {

            filePath = path.join(PUBLIC_DIR, req.url);

            // Security check
            const normalizedPath = path.normalize(filePath);

            if (!normalizedPath.startsWith(PUBLIC_DIR)) {
                handle404(res);
                return;
            }

        } else {
            // Unknown route
            handle404(res);
            return;
        }

        // Task 3 - Read and serve file
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'text/html';

        fs.readFile(filePath, (err, content) => {

            if (err) {
                if (err.code === 'ENOENT') {
                    handle404(res);
                } else {
                    handleServerError(res, err);
                }

                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType
            });

            res.end(content);
        });

    } catch (error) {
        handleServerError(res, error);
    }
});

// Task 5 - 404 error
function handle404(res) {
    const notFoundPath = path.join(PUBLIC_DIR, '404.html');

    fs.readFile(notFoundPath, (err, content) => {

        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            res.end('404 - Page Not Found');

        } else {
            res.writeHead(404, {
                'Content-Type': 'text/html'
            });

            res.end(content);
        }
    });
}

// Task 5 - 500 error
function handleServerError(res, error) {
    console.error(error);

    const serverErrorPath = path.join(PUBLIC_DIR, '500.html');

    fs.readFile(serverErrorPath, (err, content) => {

        if (err) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });

            res.end('500 - Internal Server Error');

        } else {
            res.writeHead(500, {
                'Content-Type': 'text/html'
            });

            res.end(content);
        }
    });
}

// Task 1 - Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    console.log('Available routes:');
    console.log('  GET /              -> index.html');
    console.log('  GET /about         -> about.html');
    console.log('  GET /contact       -> contact.html');
    console.log('  GET /api/time      -> Current date/time');
});