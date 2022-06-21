import axios from 'axios'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function isLogin() {
  return sessionStorage.getItem('access_token') !== null;
}

function logout() {
  sessionStorage.clear();
}

async function getToken(authCode) {
  console.debug('getToken', authCode);

  if (isLogin()) {
    console.debug('User is already login');
    return
  }

  try {
    let response = await axios.get(`${BACKEND_URL}/token`, {
      params: {
        code: authCode
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    sessionStorage.setItem('access_token', response.data.access_token);
    sessionStorage.setItem('refresh_token', response.data.refresh_token);

  } catch (error) {
    console.error(`Error in getToken(): ${error.response.data}`);
    console.error(error.config);
  }
}

async function refreshToken() {
  console.debug('refreshToken');

  const REFRESH_TOKEN = sessionStorage.getItem('refresh_token');

  if (!isLogin()) {
    console.error('User not login');
    return
  }

  try {
    let response = await axios.get(`${BACKEND_URL}/refresh`, {
      params: {
        refresh_token: REFRESH_TOKEN
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    sessionStorage.setItem('access_token', response.data.access_token);
    sessionStorage.setItem('refresh_token', response.data.refresh_token);

  } catch (error) {
    console.error(`Error in refresh_token(): ${error.response.data}`);
    console.error(error.config);
  }
}

export { getToken, refreshToken, isLogin, logout };
