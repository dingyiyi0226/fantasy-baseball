import React from 'react';
import { useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container';
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

import { selectTeams } from './metadataSlice.js';


function Home(props) {
  const teams = useSelector(state => selectTeams(state));

  return (
    <Container>
      <List>
        {teams.map(team => (
          <ListItem key={team.team_id}>
            <ListItemAvatar>
              <Avatar alt={team.name} src={team.team_logos.team_logo.url} />
            </ListItemAvatar>
            <ListItemText primary={team.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  )
}

export default Home;
