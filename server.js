import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// équivalent de __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'demo/index.html' : req.url);

    const ext = path.extname(filePath);

    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    }[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(3000, () => {
    console.log('Demo running at http://localhost:3000');
});