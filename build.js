const { execSync } = require('child_process');

console.log('📦 Building Client Workspace...');
execSync('npm install', { cwd: './client', stdio: 'inherit' });
execSync('npm run build', { cwd: './client', stdio: 'inherit' });

console.log('📦 Building Server Workspace...');
execSync('npm install', { cwd: './server', stdio: 'inherit' });

console.log('✅ Full-Stack Build Complete!');
