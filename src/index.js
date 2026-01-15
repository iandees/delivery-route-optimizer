import { Hono } from 'hono';

const app = new Hono();

// CORS middleware for the API endpoint
app.use('/api/*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

// Handle preflight requests
app.options('/api/*', (c) => {
  return c.text('OK');
});

// Generate temporary Mapbox token endpoint
app.get('/api/token', async (c) => {
  try {
    // Get the private Mapbox token from environment variables
    const privateToken = c.env.MAPBOX_PRIVATE_TOKEN;
    // Get the Mapbox account username from environment variables
    const username = c.env.MAPBOX_USERNAME;

    if (!privateToken) {
      return c.json({ error: 'Mapbox private token not configured' }, 500);
    }

    if (!username) {
      return c.json({ error: 'Mapbox username not configured' }, 500);
    }

    // Create temporary token valid for 1 hour with limited scopes
    // Use the account-specific tokens endpoint per Mapbox docs: POST /tokens/v2/{username}
    const url = `https://api.mapbox.com/tokens/v2/${encodeURIComponent(username)}`;

    // Expires must be an ISO 8601 string and no more than one hour in the future
    const expiresIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateToken}`
      },
      body: JSON.stringify({
        expires: expiresIso,
        scopes: [
          'styles:read',
          'fonts:read',
          'datasets:read',
          'vision:read',
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mapbox token creation failed:', errorText);
      return c.json({ error: 'Failed to create temporary token' }, 500);
    }

    const data = await response.json();

    return c.json({
      token: data.token,
      expires: expiresIso,
    });
  } catch (error) {
    console.error('Error creating temporary token:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
