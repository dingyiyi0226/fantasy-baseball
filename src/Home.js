import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container';
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

import { getToken } from './apis.js';

function Home(props) {
  let [searchParams, setSearchParams] = useSearchParams();
  let [league, setLeague] = useState({});
  const auth_code = searchParams.get('code');

  const getMetadataWrapper = useCallback(() => props.getMetadata(), []);

  useEffect(() => {
    const fetchMetadata = async () => {
      await getToken(auth_code);
      const league_meta = await getMetadataWrapper();
      setLeague(league_meta);
    }

    if (auth_code){
      fetchMetadata();
    }

  }, [auth_code, getMetadataWrapper]);

  return (
    <Container>
      {Object.keys(league).length === 0 && Object.keys(props.league).length === 0 ?
        <h3 className="fetching-text">Fetching</h3> :
        <List>
          {(league.teams || props.league.teams).team.map(team => (
            <ListItem>
              <ListItemAvatar>
                <Avatar alt={team.name} src={team.team_logos.team_logo.url} />
              </ListItemAvatar>
              <ListItemText primary={team.name} />
            </ListItem>
          ))}
        </List>
      }
    </Container>
  )

}

export default Home;
