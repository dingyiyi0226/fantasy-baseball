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
        [`& .MuiDrawer-paper`]: { width: 200, boxSizing: 'border-box' },
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
              <ListItemText primary="League Stats" />
              {openStat ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openStat} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="league/daily" sx={{ pl: 4 }}>
                  <ListItemText primary="Daily Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="league/weekly" sx={{ pl: 4 }}>
                  <ListItemText primary="Weekly Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="league/seasonal" sx={{ pl: 4 }}>
                  <ListItemText primary="Seasonal Stats" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="total">
              <ListItemText primary="Total Result" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onClickTeam}>
              <ListItemText primary="Team Stats" />
              {openTeam ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openTeam} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="team/weekly" sx={{ pl: 4 }}>
                  <ListItemText primary="Weekly Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="team/seasonal" sx={{ pl: 4 }}>
                  <ListItemText primary="Seasonal Stats" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="team/matchups" sx={{ pl: 4 }}>
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
