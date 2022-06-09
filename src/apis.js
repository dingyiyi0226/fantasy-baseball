import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

import CONFIG from './config.json'
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

const baseURL = 'https://fantasysports.yahooapis.com/fantasy/v2';

const apis = {

  async getMatchup(team) {
    try {
      const testStr = `${baseURL}/team/${CONFIG.LEAGUE_KEY}.t.${team}/matchups`;
      const results = await makeAPIrequest(testStr);
      return results.team;
    } catch (err) {
      console.error(`Error in getMatchup(): ${err}`);
      return err;
    }
  },

  async getTeam(team) {
    try {
      const testStr = `${baseURL}/team/${CONFIG.LEAGUE_KEY}.t.${team}/metadata`;
      const results = await makeAPIrequest(testStr);
      return results.team;
    } catch (err) {
      console.error(`Error in getTeam(): ${err}`);
      return err;
    }
  },

  async getTeamStat(team, week) {
    try {
      const testStr = `${baseURL}/team/${CONFIG.LEAGUE_KEY}.t.${team}/stats;type=week;week=${week}`;
      const results = await makeAPIrequest(testStr);
      return results.team.team_stats.stats.stat;
    } catch (err) {
      console.error(`Error in getTeamStat(): ${err}`);
      return err;
    }
  },

  async getTeams() {
    try {
      const testStr = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/teams`;
      const results = await makeAPIrequest(testStr);
      return results.league.teams.team;
    } catch (err) {
      console.error(`Error in getTeams(): ${err}`);
      return err;
    }
  },

  async getLeague() {
    try {
      const testStr = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/metadata`;
      const results = await makeAPIrequest(testStr);
      return results.league;
    } catch (err) {
      console.error(`Error in getLeague(): ${err}`);
      return err;
    }
  },

  async getLeagueSettings() {
    try {
      const testStr = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/settings`;
      const results = await makeAPIrequest(testStr);
      console.log(results)
      return results.league.settings;
    } catch (err) {
      console.error(`Error in getLeagueSettings(): ${err}`);
      return err;
    }
  }
}

export default apis
