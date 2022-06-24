import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';

function ListItemLink(props) {
  const { primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef(function Link(itemProps, ref) {
        return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
      }),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}


class Sidebar extends Component {

  constructor(props) {
    super(props)
    this.links = {
      home: 'Home',
      stats: 'Stats',
      total: 'Total Result',
      team: 'Team Weekly Stats',
    }
  }
  render() {
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
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {Object.keys(this.links).map(link => (
              <ListItemLink to={link} primary={this.links[link]} key={link}/>
            ))}
          </List>
        </Box>
      </Drawer>
    )
  }
}

export default Sidebar;
