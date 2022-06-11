const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

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
const CONFIG = '412.l.36402';

async function test() {
  try {
    // const query = `${baseURL}/teams;team_keys=${CONFIG.LEAGUE_KEY}.t.1,${CONFIG.LEAGUE_KEY}.t.2/stats;type=week;week=9`;
    // const query = `${baseURL}/teams;team_keys=${CONFIG.LEAGUE_KEY}.t.1,${CONFIG.LEAGUE_KEY}.t.2/matchups;weeks=3,4`;
    // const query = `${baseURL}/league/${CONFIG.LEAGUE_KEY};out=teams,settings`;
    // const query = `${baseURL}/game/mlb`;
    const query = `${baseURL}/users;use_login=1/games;game_keys=412/leagues`;
    const results = await makeAPIrequest(query);

    console.log(results.users.user.games.game)

  } catch (err) {
    console.error(`Error in test(): ${err}`);
  }
}

test()
