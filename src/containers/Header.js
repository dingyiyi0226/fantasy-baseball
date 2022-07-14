import React, { useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';

import AuthContext from '../contexts/AuthContext.js';
import { setLeagueKey, setGameKey, selectGame, selectLeague, selectGames, selectLeagues, isLoading } from './metadataSlice.js';


function Header(props) {
  const { setLogin } = useContext(AuthContext);
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetching = useSelector(state => isLoading(state));
  const game = useSelector(state => selectGame(state));
  const games = useSelector(state => selectGames(state));
  const league = useSelector(state => selectLeague(state));
  const leagues = useSelector(state => selectLeagues(state));


  const onLogout = (e) => {
    setLogin(false);
    navigate("/login");
  }

  const onSelectGame = (e) => {
    dispatch(setGameKey(e.target.value));
  }

  const onSelectLeague = (e) => {
    dispatch(setLeagueKey(e.target.value));
  }

  return (
    <AppBar position="fixed" elevation={3} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.toggleDrawer}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" color="inherit" component={RouterLink} to="/home" sx={{textDecoration: 'none', flexGrow: 1}}>
          Fantasy Baseball
        </Typography>

        <Button color="inherit" component={Link} sx={{mx: 0.5}}
          href="https://baseball.fantasysports.yahoo.com" target="_blank" rel="noopener noreferrer">
          Official Site
        </Button>
        {games.length > 1 &&
          <FormControl variant="standard"  hiddenLabel sx={{mx: 0.5}}>
            <Select
              labelId="season-label"
              id="season-selector"
              value={game.game_key}
              onChange={onSelectGame}
              renderValue={selected => games.find(g => g.game_key === selected).season}
              disableUnderline
            >
              {games.map(g => (
                <MenuItem value={g.game_key} key={g.game_key}>{g.season}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }

        {leagues.length > 1 &&
          <FormControl variant="standard" hiddenLabel sx={{mx: 0.5}}>
            <Select
              labelId="league-label"
              id="league-selector"
              value={fetching ? '' : league.league_key}
              onChange={onSelectLeague}
              renderValue={selected => leagues.find(l => l.league_key === selected).name}
              disableUnderline
            >
              {fetching ? null : leagues.map(l => (
                <MenuItem value={l.league_key} key={l.league_key}>{l.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }

        <Button color="inherit" value="logout" onClick={onLogout} sx={{mx: 0.5}}>Logout</Button>
          <Tooltip title="GitHub repository">
            <IconButton
              size="large"
              edge="end"
              aria-label="github repository"
              color="inherit"
              component={Link}
              href="https://github.com/dingyiyi0226/fantasy-baseball"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

export default Header;

