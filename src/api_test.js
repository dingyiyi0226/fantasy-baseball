const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const CONFIG = require('./config.json')
const CREDENTIALS = require('./credentials.json')

async function makeAPIrequest(url) {
  let response;
  try {
    response = await axios({
      url,
      method: "get",
      headers: {
        Authorization: `Bearer ${CREDENTIALS.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const parser = new XMLParser();
    const jsonData = parser.parse(response.data).fantasy_content;

    return jsonData;
  } catch (err) {
    console.error(`Error with credentials in makeAPIrequest(): ${err}`);
    return err;
  }
}

const baseURL = 'https://fantasysports.yahooapis.com/fantasy/v2';

async function test() {
  try {
    const query = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/settings`;
    const results = await makeAPIrequest(query);

    console.log(results.league.settings)

  } catch (err) {
    console.error(`Error in test(): ${err}`);
  }
}

test()
