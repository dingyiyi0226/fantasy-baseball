import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const baseURL = `${process.env.REACT_APP_BACKEND_URL}/api`
let LEAGUE_KEY = '';
let ACCESS_TOKEN = '';
let REFRESH_TOKEN = '';

async function makeAPIrequest(url) {
  if (!ACCESS_TOKEN && !sessionStorage.getItem('access_token')) {
    console.error('access_token not exists');
  } else if (!ACCESS_TOKEN) {
    ACCESS_TOKEN = sessionStorage.getItem('access_token');
    REFRESH_TOKEN = sessionStorage.getItem('refresh_token');
    console.log('get token from local storage');
  }

  let response;
  try {
    response = await axios({
      url,
      method: "get",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const parser = new XMLParser();
    const jsonData = parser.parse(response.data).fantasy_content;

    return jsonData;
  } catch (err) {
    if (err.response.data && err.response.data.error
        && err.response.data.error.description
        && err.response.data.error.description.includes("token_expired")){
      await refreshToken();
      return makeAPIrequest(url);
    } else {
      console.error(`Error with credentials in makeAPIrequest(): ${err.response.data}`);
    }
    return err;
  }
}

async function getToken(authCode) {
  // console.log('getToken', authCode);

  if (ACCESS_TOKEN || sessionStorage.getItem('access_token')) {
    console.log('auth code existed');
    return
  }

  try {
    let response = await axios.get(`${BACKEND_URL}/token`, {
      params: {
        code: authCode
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    ACCESS_TOKEN = response.data.access_token;
    REFRESH_TOKEN = response.data.refresh_token;

    sessionStorage.setItem('access_token', ACCESS_TOKEN);
    sessionStorage.setItem('refresh_token', REFRESH_TOKEN);

    // console.log('access', ACCESS_TOKEN);
    // console.log('refresh', REFRESH_TOKEN);

  } catch (error) {
    console.error(`Error in getToken(): ${error.response.data}`);
    console.error(error.config);
  }
}

async function refreshToken() {
  console.log('refreshToken');

  if (!REFRESH_TOKEN && !sessionStorage.getItem('refresh_token')) {
    console.error('refresh_token not exist');
    return
  } else if (!REFRESH_TOKEN) {
    REFRESH_TOKEN = sessionStorage.getItem('refresh_token');
  }

  try {
    let response = await axios.get(`${BACKEND_URL}/refresh`, {
      params: {
        refresh_token: REFRESH_TOKEN
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    ACCESS_TOKEN = response.data.access_token;
    REFRESH_TOKEN = response.data.refresh_token;

    // console.log('access', ACCESS_TOKEN);
    // console.log('refresh', REFRESH_TOKEN);

  } catch (error) {
    console.error(`Error in refresh_token(): ${error.response.data}`);
    console.error(error.config);
  }
}

const apis = {
  async getMetadata() {
    let metaData = {};

    try {
      // Get game info: game_key, game_weeks
      let query = `${baseURL}/game/mlb;out=game_weeks`;
      let results = await makeAPIrequest(query);
      metaData.game = results.game;

      // Get league key
      query = `${baseURL}/users;use_login=1/games;game_keys=${metaData.game.game_key}/leagues`
      results = await makeAPIrequest(query);
      LEAGUE_KEY = results.users.user.games.game.leagues.league.league_key;
      
      // Get league info: teams, league_settings
      query = `${baseURL}/league/${LEAGUE_KEY};out=teams,settings`;
      results = await makeAPIrequest(query);
      metaData.league = results.league;

      return metaData;
    } catch (err) {
      console.error(`Error in getMetadata(): ${err}`);
      return null;
    }
  },

  async getTeamsStatsByWeek(teamNum, week) {
    try {
      let team_keys = `${LEAGUE_KEY}.t.1`;
      for (let i=2;i<=teamNum;i++){
        team_keys += `,${LEAGUE_KEY}.t.${i}`;
      }
      const query = `${baseURL}/teams;team_keys=${team_keys}/stats;type=week;week=${week}`;
      const results = await makeAPIrequest(query);
      return results.teams.team;
    } catch (err) {
      console.error(`Error in getTeamsStatsByWeek(): ${err}`);
      return err;
    }
  },

  async getTeamStatsUntilWeek(team, week) {
    let week_keys = '1'
    for (let i=2;i<=week;i++){
      week_keys += `,${i}`;
    }

    const query = `${baseURL}/team/${LEAGUE_KEY}.t.${team}/matchups;weeks=${week_keys}`;

    try {
      const results = await makeAPIrequest(query);
      return results.teams.team
    } catch (err) {
      console.error(`Error in getMatchupsUntilWeek(): ${err}`);
      return err;
    }
  },

  async getMatchupsByWeek(week) {
    try {
      const query = `${baseURL}/league/${LEAGUE_KEY}/scoreboard;week=${week}`
      const results = await makeAPIrequest(query);
      return results.league.scoreboard.matchups.matchup
    } catch (err) {
      console.error(`Error in getMatchupsByWeek(): ${err}`);
      return err;
    }
  },

  async getMatchupsUntilWeek(teamNum, week) {

    let team_keys = `${LEAGUE_KEY}.t.1`;
    for (let i=2;i<=teamNum;i++){
      team_keys += `,${LEAGUE_KEY}.t.${i}`;
    }
    let week_keys = '1'
    for (let i=2;i<=week;i++){
      week_keys += `,${i}`;
    }
    const query = `${baseURL}/teams;team_keys=${team_keys}/matchups;weeks=${week_keys}`;

    try {
      const results = await makeAPIrequest(query);
      return results.teams.team
    } catch (err) {
      console.error(`Error in getMatchupsUntilWeek(): ${err}`);
      return err;
    }
  },
}

export { apis, getToken };
