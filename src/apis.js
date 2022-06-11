import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

import CREDENTIALS from './credentials.json'

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

async function getLeagueKey() {
  try {
    // const query = `${baseURL}/game/mlb`;  // get game_key=412
    const query = `${baseURL}/users;use_login=1/games;game_keys=412/leagues`;
    const results = await makeAPIrequest(query);
    return results.users.user.games.game.leagues.league.league_key;
  } catch (err) {
    console.error(`Error in getLeagueKey(): ${err}`);
    return err;
  }
}

const baseURL = 'https://fantasysports.yahooapis.com/fantasy/v2';
let LEAGUE_KEY = '';

const apis = {

  async getTeamStatsByWeek(teamNum, week) {
    try {
      let team_keys = `${LEAGUE_KEY}.t.1`;
      for (let i=2;i<=teamNum;i++){
        team_keys += `,${LEAGUE_KEY}.t.${i}`;
      }
      const query = `${baseURL}/teams;team_keys=${team_keys}/stats;type=week;week=${week}`;
      const results = await makeAPIrequest(query);
      return results.teams.team;
    } catch (err) {
      console.error(`Error in getTeamStatsByWeek(): ${err}`);
      return err;
    }
  },

  async getMetadata() {
    try {
      LEAGUE_KEY = await getLeagueKey();
      const query = `${baseURL}/league/${LEAGUE_KEY};out=teams,settings`;
      const results = await makeAPIrequest(query);
      return results.league;
    } catch (err) {
      console.error(`Error in getMetadata(): ${err}`);
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

export default apis
