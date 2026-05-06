import https from 'https';

/**
 * Pings the server's own URL to keep it awake on Render's free tier.
 * @param {string} url - The URL to ping.
 */
export const startKeepAlive = (url) => {
  if (!url) {
    console.warn('⚠️  Keep-alive: No URL provided. Skipping...');
    return;
  }

  console.log(`📡 Keep-alive: Started (pinging ${url} every 10 minutes)`);

  // Ping every 10 minutes (600,000 ms)
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`🩺 Keep-alive ping sent. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('❌ Keep-alive ping failed:', err.message);
    });
  }, 600000); 
};
