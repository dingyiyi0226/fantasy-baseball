const FANTASY_TIMEZONE = -7;  // 'America/Los_Angeles' (UTC-7)

function to_fantasy_date(localDate) {
  localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset() + FANTASY_TIMEZONE*60);
  return localDate;
}

function to_local_date(fantasyDate) {
  fantasyDate.setMinutes(fantasyDate.getMinutes() - fantasyDate.getTimezoneOffset() - FANTASY_TIMEZONE*60);
  return fantasyDate;
}

export { to_fantasy_date, to_local_date };
