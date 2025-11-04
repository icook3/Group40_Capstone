// strava.js: Handles Strava OAuth and activity upload
export class Strava {
  constructor({ clientId = 'YOUR_STRAVA_CLIENT_ID', clientSecret = 'YOUR_STRAVA_CLIENT_SECRET', redirectUri = (typeof window !== 'undefined' ? window.location.origin + '/zlow/' : ''), accessToken = null } = {}) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.accessToken = accessToken;
    this.STRAVA_BASE_URL = 'https://www.strava.com';
    this.STRAVA_TOKEN_URL = this.STRAVA_BASE_URL + '/oauth/token';
    this.STRAVA_ACTIVITIES_URL = this.STRAVA_BASE_URL + '/api/v3/activities';
  }

  async authenticatePopup() {
    const url = `${this.STRAVA_BASE_URL}/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&approval_prompt=auto&scope=activity:write`;
    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'strava_oauth', 'width=600,height=700');
      if (!popup) return reject('Popup blocked');
      function handleMessage(event) {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.stravaCode) {
          window.removeEventListener('message', handleMessage);
          popup.close();
          resolve(event.data.stravaCode);
        }
      }
      window.addEventListener('message', handleMessage);
    });
  }

  async exchangeToken(code) {
    // This requires a backend proxy for security in production
    const res = await fetch(this.STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${code}&grant_type=authorization_code`
    });
    const data = await res.json();
    this.accessToken = data.access_token;
  }

  async uploadActivity({name, description, distance, duration, avgPower, isTrainer}) {
    if (!this.accessToken) throw new Error('Not authenticated');
    const res = await fetch(this.STRAVA_ACTIVITIES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        distance: distance * 1000, // meters
        moving_time: duration, // seconds
        type: 'VirtualRide',
        trainer: 1,
        average_watts: avgPower
      })
    });
    return await res.json();
  }
}
