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

  async getTeamStatsByWeek(team, week) {
    try {
      const query = `${baseURL}/team/${CONFIG.LEAGUE_KEY}.t.${team}/stats;type=week;week=${week}`;
      const results = await makeAPIrequest(query);
      return results.team.team_stats.stats.stat;
    } catch (err) {
      console.error(`Error in getTeamStatsByWeek(): ${err}`);
      return err;
    }
  },

  async getTeams() {
    try {
      const query = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/teams`;
      const results = await makeAPIrequest(query);
      return results.league.teams.team;
    } catch (err) {
      console.error(`Error in getTeams(): ${err}`);
      return err;
    }
  },

  async getLeague() {
    try {
      const query = `${baseURL}/league/${CONFIG.LEAGUE_KEY}/settings`;
      const results = await makeAPIrequest(query);
      return results.league;
    } catch (err) {
      console.error(`Error in getLeagueSettings(): ${err}`);
      return err;
    }
  }
}

export default apis
