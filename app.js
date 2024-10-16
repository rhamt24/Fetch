const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Route to serve the HTML form from the public folder
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
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');

    // Only allow text or JSON responses
    if (!/text|json/.test(contentType)) {
      return res.send('<h3>Error: Only text or JSON responses are supported</h3>');
    }

    const text = await response.text();
    res.send(`
      <html>
      <head>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <h1>Fetched Data</h1>
          <pre>${text.slice(0, 65536)}</pre>
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
