// Post-build script: Add SPA redirect to index.html
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

// SPA redirect script that converts pathname to hash-based routing
const redirectScript = `<script>
// SPA redirect - convert /path to /#/path for hash-based routing
if (!location.pathname.startsWith('/assets') && !location.hash) {
  location.hash = location.pathname + location.search;
}
</script>`;

// Loading indicator while React initializes
const loadingStyle = `<style>
body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; }
#loading { text-align: center; color: #28262a; }
</style>`;
const loadingDiv = `<div id="loading" style="text-align:center;padding:20px;">Loading DailyNotion...</div>`;

let modified = html;
if (!html.includes('SPA redirect')) {
  // Add loading indicator to root div
  modified = modified.replace('<div id="root"></div>', `<div id="root">${loadingDiv}${loadingStyle}</div>`);
  // Add redirect script before </body>
  modified = modified.replace('</body>', redirectScript + '\n  </body>');
  fs.writeFileSync('dist/index.html', modified);
  console.log('✅ Added SPA redirect and loading indicator to index.html');
} else {
  // Make sure loading indicator is present
  if (!html.includes('id="loading"')) {
    modified = modified.replace('<div id="root"></div>', `<div id="root">${loadingDiv}${loadingStyle}</div>`);
    fs.writeFileSync('dist/index.html', modified);
    console.log('✅ Added loading indicator to index.html');
  } else {
    console.log('✓ SPA redirect and loading indicator already present');
  }
}
