import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function Footer(props) {
  return (
    <Box component="footer" sx={{py: 1, bgcolor: 'background.footer', zIndex: (theme) => theme.zIndex.drawer + 1}}>
      <Container sx={{px: 0}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{lineHeight: '15px'}}
          >
            {'Copyright © 2022 '}
            <Link color="inherit" href="https://github.com/dingyiyi0226" underline="none">
              dingyiyi0226
            </Link>
            {'.'}
          </Typography>

          <Link href="https://www.yahoo.com/?ilc=401" target="_blank" rel="noopener noreferrer" underline="none">
            <Box component="img" sx={{height: '15px'}} alt="poweredby-yahoo" src={'https://poweredby.yahoo.com/poweredby_yahoo_h_purple_retina.png'}/>
          </Link>
          
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer;