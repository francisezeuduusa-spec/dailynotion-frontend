const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DailyNotion</title>
    <link rel="stylesheet" crossorigin href="/assets/index-1bOgCC9_.css">
    <script>
      window.onerror = function(msg, url, line, col, error) {
        document.getElementById('root').innerHTML = '<div style="padding:20px;font-family:sans-serif;color:red;"><h3>Error</h3><p>' + msg + '</p><small>Line: ' + line + '</small></div>';
        return true;
      };
    </script>
  </head>
  <body>
    <div id="root" style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#fff;">
      <div style="text-align:center;">
        <div style="width:40px;height:40px;border:4px solid #c8dfaa;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
        <div style="color:#28262a;font-size:16px;">Loading DailyNotion...</div>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
    <script type="module" crossorigin src="/assets/index-kbDDUWVr.js"></script>
    <script>
    if (!location.pathname.startsWith('/assets') && !location.hash) {
      location.hash = location.pathname + location.search;
    }
    </script>
  </body>
</html>`;

fs.writeFileSync(indexPath, html);
console.log('✅ Updated index.html with loading state and error handling');
