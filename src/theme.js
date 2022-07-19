import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#dbcabb',
      contrastText: '#181818',
      dark: '#9f866e',
      light: '#f4eadd',
    },
    secondary: {
      main: '#d14945',
      contrastText: '#e8e8e8',
      light: '#ff7a70',
      dark: '#9a0f1d',
    },
    background: {
      default: '#fff8f2',
      footer: '#faede4',
      paper: '#ffffff',
      paperDark: '#f4f4f4',
    },
    status: {
      win: '#dbbbbc',
      lose: '#dbdabb',
      tie: '#dbcabb',
    },
    matchup: [
      '#ecf3fb', '#d3e1ec', '#bbccdb', '#f4eadd', '#dbcabb', '#bda795'
    ],
    transaction: {
      add: '#9e221d',
      drop: '#9d9f30',
      timestamp: '#a9998b',
    },
  },
  typography: {
    fontFamily: 'Lora',
    h6: {
      fontWeight: 'bold',
    },
    pageTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    pageSubtitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
    }
  },
});

export default theme;
