export default async function handler(req, res) {
  // Twilio credentials — server-side only, never exposed to browser
  const SID = 'AC7be6c636ce4343b00fce057d43d4f5b8';
  const AUTH = 'de22f2e70aa3387dc7d7adc58c4a93e1';
  const FROM = '+15043058622';
  const PIN = '2026'; // Must match app PIN

  // Phone numbers
  const NUMBERS = {
    chad: '+16308647869',
    blake: '+15733440293',
    noah: '+18705730060'
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { message, pin } = req.body || {};
    if (pin !== PIN) return res.status(401).json({ error: 'Unauthorized' });
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // Determine recipients: specific person or all
    const recipients = to 
      ? (Array.isArray(to) ? to : [to]).map(t => NUMBERS[t] || t)
      : Object.values(NUMBERS);

    const results = [];
    for (const number of recipients) {
      try {
        const resp = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(SID + ':' + AUTH).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ To: number, From: FROM, Body: message })
          }
        );
        const data = await resp.json();
        results.push({ number, status: data.status || 'sent', sid: data.sid });
      } catch (e) {
        results.push({ number, status: 'error', error: e.message });
      }
    }

    return res.status(200).json({ sent: results.length, results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
