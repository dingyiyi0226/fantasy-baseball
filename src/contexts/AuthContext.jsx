import React from 'react';

const AuthContext = React.createContext({
  isLogin: false,
  setLogin: () => {}
});

export default AuthContext;
