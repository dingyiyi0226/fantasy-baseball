function statsPreprocessing(statsRaw, statCate) {
  // statsRaw: [{}, {},]
  // Return: {<team_id>: [{stat_id:, value:, rank:}, ]}

  let stats = {};
  statsRaw.forEach(team => {
    stats[team.team_id] = team.team_stats.stats.stat.map(s => ({...s, rank: undefined}));
  })

  Object.keys(stats).forEach(team_id => {
    stats[team_id].forEach((stat, i) => {
      if (stat.value === 'INF') {
        stats[team_id][i].value = Infinity;
      }
    })
  })

  // Calculate Rank
  const statCateKey = statCate.reduce((pv, v) => ({...pv, [v.stat_id]: v}), {});
  let statsT = {}
  statCate.forEach(s => {
    statsT[s.stat_id] = []
  })

  Object.values(stats).forEach(teamStats => {
    teamStats.forEach(s => {
      statsT[s.stat_id].push(s.value)
    })
  })

  for (let [stat_id, stat] of Object.entries(statsT)){
    const sort_order = statCateKey[stat_id].sort_order === 0;
    stat.sort((a, b) => sort_order ? a-b : b-a)
  }

  Object.values(stats).forEach(teamStats => {
    teamStats.forEach(stat => {
      if(!statCateKey[stat.stat_id].is_only_display_stat) {
        stat.rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
      }
    })
  })
  return stats;
}

function statsH2H(stats, statCate, teams) {
  // stats: {<team_id>: [{stat_id:, value:, rank:}, ]}
  // Return: {<team_id>: {<opteam_id>: {win: [], lose: [], status: 'win'|'lose'|'tie' }}}

  let h2h = {};
  let ranks = {};  // {<team_id>: {stat_id: rank}}
  teams.forEach(team => {
    ranks[team.team_id] = stats[team.team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});
  })

  teams.forEach(team => {
    h2h[team.team_id] = {};

    Object.keys(stats).filter(team_id => Number(team_id) !== team.team_id).forEach(team_id => {
      let win = [];
      let lose = [];
      statCate.filter(s => !s.is_only_display_stat).forEach(s => {
        if (ranks[team.team_id][s.stat_id] < ranks[team_id][s.stat_id]) {
          win.push(s.stat_id);
        }
        else if (ranks[team.team_id][s.stat_id] > ranks[team_id][s.stat_id]) {
          lose.push(s.stat_id);
        }
      })
      let status;
      if (win.length > lose.length) {
        status = 'win';
      } else if (win.length < lose.length) {
        status = 'lose';
      } else {
        status = 'tie';
      }
      let result = {
        win: win,
        lose: lose,
        status: status
      };
      h2h[team.team_id][team_id] = result;
    })
  })
  return h2h;
}

function statsRankAvg(stats) {
  const rankAvg = {};
  Object.keys(stats).forEach(team_id => {
    const ranks = [];
    Object.values(stats[team_id]).forEach(s => {
      if (s.rank !== undefined){
        ranks.push(s.rank);
      }
    })
    rankAvg[team_id] = (ranks.reduce((pv, v) => pv+v, 0) / ranks.length).toFixed(2);
  })
  return rankAvg;
}

function statsH2HSum(h2h) {
  const h2hSum = {};
  Object.keys(h2h).forEach(team_id => {
    const sum = {win: 0, lose: 0, tie: 0};
    Object.values(h2h[team_id]).forEach(opTeam => {
      if (opTeam.status === 'win') {
        sum.win += 1;
      } else if (opTeam.status === 'lose') {
        sum.lose += 1;
      } else {
        sum.tie += 1;
      }
    })
    h2hSum[team_id] = sum;
  })
  return h2hSum;
}

export { statsPreprocessing, statsH2H, statsRankAvg, statsH2HSum };
