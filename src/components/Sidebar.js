import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


function Sidebar(props) {
  const [openStat, setOpenStat] = useState(false);
  const [openTeam, setOpenTeam] = useState(false);

  const onClickStat = () => {
    setOpenStat(!openStat);
  }

  const onClickTeam = () => {
    setOpenTeam(!openTeam);
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 200,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 200, boxSizing: 'border-box', bgcolor: 'background.default' },
      }}
    >
      <Toolbar variant="dense"/>
      <Box sx={{ overflow: 'auto'}}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="home">
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onClickStat}>
              <ListItemText primary="Stats" />
              {openStat ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openStat} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="stats/daily" sx={{ pl: 4 }}>
                  <ListItemText primary="Daily Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="stats/weekly" sx={{ pl: 4 }}>
                  <ListItemText primary="Weekly Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="stats/seasonal" sx={{ pl: 4 }}>
                  <ListItemText primary="Seasonal Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="stats/win-loss" sx={{ pl: 4 }}>
                  <ListItemText primary="Win-Loss Stats" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="player-ranking">
              <ListItemText primary="Player Ranking" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="transactions">
              <ListItemText primary="Transactions" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onClickTeam}>
              <ListItemText primary="Teams" />
              {openTeam ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openTeam} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="teams/1/weekly" sx={{ pl: 4 }}>
                  <ListItemText primary="Weekly Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="teams/1/seasonal" sx={{ pl: 4 }}>
                  <ListItemText primary="Seasonal Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="teams/1/matchups" sx={{ pl: 4 }}>
                  <ListItemText primary="Matchups" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar;
