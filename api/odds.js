export default async function handler(req, res) {
  const API_KEY = 'bb800272b82fc44ac9bd82ca18815bd2';
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Build the Odds API URL
  // path comes in like: sports/basketball_nba/events
  // or: sports/basketball_nba/events/abc123/odds
  const params = new URLSearchParams(req.query);
  params.delete('path');
  params.set('apiKey', API_KEY);
  
  const url = `https://api.the-odds-api.com/v4/${path}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Forward quota headers
    const used = response.headers.get('x-requests-used');
    const remaining = response.headers.get('x-requests-remaining');
    if (used) res.setHeader('x-requests-used', used);
    if (remaining) res.setHeader('x-requests-remaining', remaining);
    
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
