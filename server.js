const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = 3000;

// Function to read database
async function readDatabase() {
    try {
        const data = await fs.readFile('database.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty classes array
        if (error.code === 'ENOENT') {
            return { classes: [] };
        }
        throw error;
    }
}

// Function to write to database
async function writeDatabase(data) {
    await fs.writeFile('database.json', JSON.stringify(data, null, 2), 'utf8');
}

// Create HTTP server
const server = http.createServer(async (request, response) => {
    // Enable CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    // Parse the URL
    const parsedUrl = url.parse(request.url, true);

    // Serve static files
    if (request.method === 'GET') {
        let filePath = '.' + parsedUrl.pathname;
        
        // Default to index.html if root is requested
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = path.extname(filePath);
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        try {
            const content = await fs.readFile(filePath);
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                response.writeHead(500);
                response.end(`Server Error: ${error.code}`, 'utf-8');
            }
        }
    }
    // Handle class creation
    else if (request.method === 'POST' && parsedUrl.pathname === '/create-class') {
        let body = '';
        
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            try {
                // Parse the incoming class data
                const newClass = JSON.parse(body);
                
                // Validate the class data
                if (!newClass.name) {
                    throw new Error('Class name is required');
                }

                // Read existing database
                const database = await readDatabase();
                
                // Assign a unique ID to the class
                newClass.id = Date.now().toString();

                // Add new class
                database.classes.push(newClass);
                
                // Write updated database
                await writeDatabase(database);

                // Log the class details
                console.log('Created Class:', JSON.stringify({
                    name: newClass.name,
                    teacherName: `${newClass.teacher.firstName} ${newClass.teacher.lastName}`,
                    studentCount: newClass.students.length,
                    madrichCount: newClass.madrichim.length
                }, null, 2));

                response.writeHead(201, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    message: 'Class created successfully', 
                    class: newClass 
                }));
            } catch (error) {
                console.error('Class Creation Error:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    message: 'Error creating class', 
                    error: error.message 
                }));
            }
        });
    }
    else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});