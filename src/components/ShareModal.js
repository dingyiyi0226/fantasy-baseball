import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { download_img } from '../utils/share.js';

function ShareModal(props) {
  const { title, canvasURL, open, onClose } = props;

  const onDownloadImg = () => {
    download_img(canvasURL, title);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box display="flex" flexDirection="column" alignItems="center"
        sx={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "50%", borderRadius: '4px', bgcolor: "background.default", boxShadow: 24, p: 2}}>

        <Typography variant="h6" sx={{pb: 2}}>Export the data</Typography>
        <Box component="img" alt="share-canvas" src={canvasURL}
          sx={{width: "90%", mb: 2, borderRadius: '4px', boxShadow: 2}}
        />
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <Button variant="contained" onClick={onDownloadImg}>Download</Button>
        </Stack>
      </Box>
    </Modal>
  )
}

export default ShareModal;
