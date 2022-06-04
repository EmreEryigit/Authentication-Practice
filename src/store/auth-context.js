import React, { useState, useEffect } from "react";
let logoutTimer;
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjTime = new Date(expirationTime).getTime();

  const remainingTime = adjTime - currentTime;
  return remainingTime;
};

const retrieveToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpTime = localStorage.getItem("expTime");
  const remainingTime = calculateTime(storedExpTime);
  if (remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expTime");
    return null;
  }
  return {
    token: storedToken,
    expTime: remainingTime,
  };
};
export const AuthContextProvider = (props) => {
  const tokenData = retrieveToken();

  let initToken;
  if (tokenData) {
    initToken = tokenData.token;
  }
  const [token, setToken] = useState(initToken);
  const userIsLoggedin = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };
  const loginHandler = (token, expTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expTime", expTime);
    const remainingTime = calculateTime(expTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };
  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.expTime);
      logoutTimer = setTimeout(logoutHandler, tokenData.expTime);
    }
  }, [tokenData]);
  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedin,
    login: loginHandler,
    logout: logoutHandler,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
