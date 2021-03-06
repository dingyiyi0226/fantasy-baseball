import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

import { selectTeam } from './Teams/teamsSlice.js';

function Sidebar(props) {
  const team = useSelector(state => selectTeam(state));

  const [openStat, setOpenStat] = useState(false);
  const [openTeam, setOpenTeam] = useState(false);

  const drawerWidth = 200;

  const onClickStat = () => {
    setOpenStat(!openStat);
  }

  const onClickTeam = () => {
    setOpenTeam(!openTeam);
  }

  const drawer = (
    <React.Fragment>
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
            <ListItemButton component={Link} to="teamcompare">
              <ListItemText primary="Team Compare" />
            </ListItemButton>
          </ListItem>

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
                <ListItemButton component={Link} to={`teams/${team}/weekly`} sx={{ pl: 4 }}>
                  <ListItemText primary="Weekly Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to={`teams/${team}/seasonal`} sx={{ pl: 4 }}>
                  <ListItemText primary="Seasonal Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to={`teams/${team}/matchups`} sx={{ pl: 4 }}>
                  <ListItemText primary="Matchups" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Box>
    </React.Fragment>
  )

  return (
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={props.drawerOpen}
          onClose={props.toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.default'},
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block' },
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.default' },
          }}
        >
          {drawer}
        </Drawer>
    </Box>
  )
}

export default Sidebar;
