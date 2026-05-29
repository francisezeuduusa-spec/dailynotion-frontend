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

if (!html.includes('SPA redirect')) {
  const modified = html.replace('</body>', redirectScript + '\n  </body>');
  fs.writeFileSync('dist/index.html', modified);
  console.log('✅ Added SPA redirect script to index.html');
} else {
  console.log('✓ SPA redirect already present');
}
