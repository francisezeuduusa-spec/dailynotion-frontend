import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.VITE_API_URL || 'https://dailynotion-backend.onrender.com';

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend
app.use('/api', (req, res) => {
  const targetUrl = `${API_URL}/api${req.path}`;
  const method = req.method;
  const headers = {...req.headers};
  delete headers['host'];
  
  const options = {
    method,
    headers,
  };
  
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    options.body = JSON.stringify(req.body);
  }
  
  fetch(targetUrl, options)
    .then(response => {
      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Proxy failed' });
    });
});

// SPA fallback - all routes go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});