import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container';
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';


function Home(props) {
  let [searchParams, setSearchParams] = useSearchParams();
  let [league, setLeague] = useState({});
  const authCode = searchParams.get('code');

  const getMetadataWrapper = useCallback((authCode) => props.getMetadata(authCode), []);

  useEffect(() => {
    const fetchMetadata = async (authCode) => {
      const league_meta = await getMetadataWrapper(authCode);
      setLeague(league_meta);
    }

    fetchMetadata(authCode)

  }, [authCode, getMetadataWrapper]);

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
