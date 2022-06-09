// Reference: https://github.com/edwarddistel/yahoo-fantasy-baseball-reader

const fs = require('fs');
const qs = require('qs');
const axios = require('axios');

const CONFIG = require('./config.json');
const CREDENTIALS = require('./credentials.json');

const AUTH_HEADER = btoa(`${CONFIG.CONSUMER_KEY}:${CONFIG.CONSUMER_SECRET}`)
const AUTH_ENDPOINT = `https://api.login.yahoo.com/oauth2/get_token`

// Write to an external file to display output data
function writeToFile(data, file, flag) {
  if (flag === null) {
    flag = `a`;
  }
  fs.writeFile(file, data, { flag }, (err) => {
    if (err) {
      console.error(`Error in writing to ${file}: ${err}`);
    }
  });
  return 1;
};

// If authorization token is stale, refresh it
function refreshAuthorizationToken(token) {
  return axios({
    url: AUTH_ENDPOINT,
    method: "post",
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      redirect_uri: "oob",
      grant_type: "refresh_token",
      refresh_token: token,
    }),
  }).catch((err) => {
    console.error(`Error in refreshAuthorizationToken(): ${err}`);
  });
}

async function refresh() {
  const newToken = await refreshAuthorizationToken(CREDENTIALS.refresh_token);
  if (newToken && newToken.data && newToken.data.access_token) {
    writeToFile(JSON.stringify(newToken.data), CONFIG.AUTH_FILE, "w");
    console.log('Write new token to file');
  }
}

refresh();
