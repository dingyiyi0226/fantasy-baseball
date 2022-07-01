import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#dbcabb',
      contrastText: '#181818',
      dark: '#a9998b',
      light: '#fffded',
    },
    secondary: {
      main: '#d14945',
      contrastText: '#e8e8e8',
      light: '#ff7a70',
      dark: '#9a0f1d',
    },
    background: {
      default: '#fff8f2',
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
    ]
  },
  typography: {
    fontFamily: 'Lora'
  },
});

export default theme;
