import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

import { getToken, refreshToken } from './auth.js'

const baseURL = `${process.env.REACT_APP_BACKEND_URL}/api`
let LEAGUE_KEY = '';

async function makeAPIrequest(url) {
  const ACCESS_TOKEN = sessionStorage.getItem('access_token');
  if (!ACCESS_TOKEN) {
    console.error('access_token not exists');
  }

  let response;
  try {
    response = await axios.get(url, {
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
      console.error(`Error in makeAPIrequest(): ${err.response.data}`);
    }
    return err;
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
      let team_keys = [...Array(teamNum).keys()].map(i => `${LEAGUE_KEY}.t.${i+1}`);

      const query = `${baseURL}/teams;team_keys=${team_keys.join(',')}/stats;type=week;week=${week}`;
      const results = await makeAPIrequest(query);
      return results.teams.team;
    } catch (err) {
      console.error(`Error in getTeamsStatsByWeek(): ${err}`);
      return err;
    }
  },

  async getTeamStatsUntilWeek(team, week) {

    let week_keys = [...Array(week).keys()].map(i => i+1);

    const query = `${baseURL}/team/${LEAGUE_KEY}.t.${team}/matchups;weeks=${week_keys.join(',')}`;

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

    let team_keys = [...Array(teamNum).keys()].map(i => `${LEAGUE_KEY}.t.${i+1}`);
    let week_keys = [...Array(week).keys()].map(i => i+1);

    const query = `${baseURL}/teams;team_keys=${team_keys.join(',')}/matchups;weeks=${week_keys.join(',')}`;

    try {
      const results = await makeAPIrequest(query);
      return results.teams.team
    } catch (err) {
      console.error(`Error in getMatchupsUntilWeek(): ${err}`);
      return err;
    }
  },

  async getTeamRosterStatsByDate(team, date) {

    const team_key = `${LEAGUE_KEY}.t.${team}`;
    const query = `${baseURL}/team/${team_key}/roster;date=${date}/players;out=stats`

    try {
      const results = await makeAPIrequest(query);
      return results.team.roster.players.player
    } catch (err) {
      console.error(`Error in getTeamStatsByDate(): ${err}`);
      return err;
    }
  },

  async getTeamRosterByDate(team, date) {
    const team_key = `${LEAGUE_KEY}.t.${team}`;
    const query = `${baseURL}/team/${team_key}/roster;date=${date}/players`

    try {
      const results = await makeAPIrequest(query);
      return results.team.roster.players.player
    } catch (err) {
      console.error(`Error in getTeamRosterByDate(): ${err}`);
      return err;
    }
  },

  async getPlayerAllStatsByDate(player_keys, date) {

    const query = `${baseURL}/players;player_keys=${player_keys.join(',')}/stats;type=date;date=${date}`

    try {
      const results = await makeAPIrequest(query);
      return results.players.player
    } catch (err) {
      console.error(`Error in getPlayerStatsByDate(): ${err}`);
      return err;
    }
  },

  async getAllStats() {
    const query = `${baseURL}/game/mlb/stat_categories`;
    try {
      const results = await makeAPIrequest(query);
      return results.game.stat_categories.stats.stat;
    } catch (err) {
      console.error(`Error in getPlayerStatsByDate(): ${err}`);
      return err;
    }
  }

}

export { apis, getToken };
