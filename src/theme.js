import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#5286BA',
    },
    secondary: {
      main: '#D93E2B',
    },
    success: {
      main: '#789349',
    },
    info: {
      main: '#36b6bf',
    },
    background: {
      default: '#f9f8f1',
      paper: '#F9F8F1',
    },
  },
  typography: {
    fontFamily: 'Lora'
  },
});

export default theme;
