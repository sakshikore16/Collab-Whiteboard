import Keycloak from 'keycloak-js';

let keycloak: Keycloak.KeycloakInstance | null = null;

export function getKeycloak() {
  if (typeof window !== 'undefined' && !keycloak) {
    keycloak = new Keycloak({
      url: 'http://localhost:8081/', // Keycloak server URL
      realm: 'collab-whiteboard',       // Keycloak realm (updated)
      clientId: 'whiteboard-frontend', // Keycloak client ID
    });
  }
  return keycloak;
}

export default getKeycloak; 