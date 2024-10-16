const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML form from the public folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET route to handle URL fetching
app.get('/fetch-url', async (req, res) => {
  const url = req.query.url;
  
  // Validate URL
  if (!/^https?:\/\//.test(url)) {
    return res.send('<h3>Error: URL must start with http:// or https://</h3>');
  }

  try {
    // Parse the URL and construct the request
    let _url = new URL(url);
    let constructedUrl = `${_url.origin}${_url.pathname}?${_url.searchParams.toString()}`;

    let response = await fetch(constructedUrl);
    let contentType = response.headers.get('content-type');
    let contentLength = response.headers.get('content-length');
    
    // Check if content length exceeds the limit (100MB in this case)
    if (contentLength > 100 * 1024 * 1024) {
      return res.send(`<h3>Error: Content too large (Size: ${contentLength} bytes)</h3>`);
    }

    // Check content type
    if (!/text|json/.test(contentType)) {
      return res.send(`<h3>Error: Unsupported content type: ${contentType}</h3>`);
    }

    // Fetch the content as buffer and try to format it as JSON if possible
    let data = await response.buffer();
    let result;

    try {
      result = util.format(JSON.parse(data.toString()));
    } catch (e) {
      result = data.toString();  // If it's not JSON, return as plain text
    }

    // Return the result formatted in HTML
    res.send(`
      <html>
      <head>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <h1>Fetched Data</h1>
          <pre>${result.slice(0, 65536)}</pre>  <!-- Show up to 65536 characters -->
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`<h3>Error fetching URL: ${error.message}</h3>`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
