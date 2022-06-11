// Reference: https://github.com/edwarddistel/yahoo-fantasy-baseball-reader

const fs = require('fs');
const qs = require('qs');
const axios = require('axios');

const CONFIG = require('./config.json');

const AUTH_HEADER = btoa(`${CONFIG.CONSUMER_KEY}:${CONFIG.CONSUMER_SECRET}`)
const AUTH_ENDPOINT = `https://api.login.yahoo.com/oauth2/get_token`
const AUTH_FILE = 'src/credentials.json'

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

// If no credential.json file, initialize first authorization
function getInitialAuthorization() {
  return axios({
    url: AUTH_ENDPOINT,
    method: "post",
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      client_id: CONFIG.CONSUMER_KEY,
      client_secret: CONFIG.CONSUMER_SECRET,
      redirect_uri: "oob",
      code: CONFIG.YAHOO_AUTH_CODE,
      grant_type: "authorization_code",
    }),
  }).catch((err) => {
    console.error(`Error in getInitialAuthorization(): ${err}`);
  });
}

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

async function getToken() {
  if (fs.existsSync(AUTH_FILE)){
    const credentials = require('./credentials.json');
    const newToken = await refreshAuthorizationToken(credentials.refresh_token);
    if (newToken && newToken.data && newToken.data.access_token) {
      writeToFile(JSON.stringify(newToken.data), AUTH_FILE, "w");
      console.log('Refresh token');
    }
  }
  else {
    const newToken = await getInitialAuthorization();
    if (newToken && newToken.data && newToken.data.access_token) {
      writeToFile(JSON.stringify(newToken.data), AUTH_FILE, "w");
      console.log('Write new token to file');
    }
  }
}

getToken();
