import React from 'react';

import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container';
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';


function Home(props) {
  return (
    <Container>
      <List>
        {props.league.teams.team.map(team => (
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
