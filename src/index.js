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

    if (!privateToken) {
      return c.json({ error: 'Mapbox private token not configured' }, 500);
    }

    // Create temporary token valid for 1 hour with limited scopes
    const response = await fetch('https://api.mapbox.com/tokens/v2/temporary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateToken}`
      },
      body: JSON.stringify({
        expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        scopes: [
          'styles:read',
          'fonts:read',
          'datasets:read',
          'vision:read',
          'navigation:trips',
          'geocoding:read'
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
      expires: data.expires
    });
  } catch (error) {
    console.error('Error creating temporary token:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
