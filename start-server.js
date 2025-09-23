const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ZYVA Healthcare Backend Server...');
console.log('==========================================');

const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Server process exited with code ${code}`);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGTERM');
});


