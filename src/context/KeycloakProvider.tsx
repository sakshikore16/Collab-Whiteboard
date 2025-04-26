import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import getKeycloak from '../keycloak';

interface KeycloakContextType {
  keycloak: any;
  initialized: boolean;
  authenticated: boolean;
  userInfo: any;
  token: string | undefined;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const keycloak = getKeycloak();
    if (!keycloak) return;

    keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
      enableLogging: true,
    }).then(auth => {
      setAuthenticated(auth);
      setInitialized(true);
      if (auth) {
        setToken(keycloak.token);
        keycloak.loadUserInfo().then(setUserInfo);
      }
    });

    // Token refresh
    const refreshInterval = setInterval(() => {
      if (keycloak.token) {
        keycloak.updateToken(60).then(refreshed => {
          if (refreshed) setToken(keycloak.token);
        });
      }
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const keycloak = getKeycloak();
  const login = () => keycloak?.login();
  const logout = () => keycloak?.logout();

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized, authenticated, userInfo, token, login, logout }}>
      {initialized ? children : <div>Loading authentication...</div>}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const ctx = useContext(KeycloakContext);
  if (!ctx) throw new Error('useKeycloak must be used within a KeycloakProvider');
  return ctx;
}; 