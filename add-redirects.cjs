const fs = require('fs');
const path = require('path');

// Create _redirects file for Netlify-style SPA routing
const redirectsContent = '/*    /index.html   200\n';
fs.writeFileSync(path.join(__dirname, 'dist', '_redirects'), redirectsContent);
console.log('Created _redirects for SPA routing');
