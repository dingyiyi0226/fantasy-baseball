import React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';


function PageTitle(props) {
  return (
    <React.Fragment>
      <Typography variant="pageTitle" display="block">{props.title}</Typography>
      <Typography variant="subtitle2" display="block" color="primary.dark">{props.subtitle}</Typography>
      <Divider sx={{mt: 1, mb: 2}} />
    </React.Fragment>
  )
}

export default PageTitle;
