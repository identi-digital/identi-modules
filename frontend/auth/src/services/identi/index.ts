// import apiClient from '../api_identi';
import { getServiceApi } from '@/core/apiRegistry';
const apiClient = () => getServiceApi('authx');

import {
  generateRandomString,
  pkce_challenge_from_verifier,
} from './generate_code_challenge';
import {
  AUTHX_API,
  AUTHX_CLIENT_ID,
  AUTHX_REDIRECT_URI,
  AUTHX_RESPONSE_TYPE,
  AUTHX_SCOPE,
} from '../../config/environment';
// import {
//   AUTHX_API,
//   AUTHX_REDIRECT_URI,
//   AUTHX_CLIENT_ID,
//   AUTHX_RESPONSE_TYPE,
//   AUTHX_SCOPE,
// } from '~/config/environment';

// const AUTHX_API = 'https://authx2.d.identi.digital/';
// const AUTHX_REDIRECT_URI = 'http://localhost:3000/redirect';
// const AUTHX_CLIENT_ID = 'C696MG2G92s8OctKe9Ehvtp3';
// const AUTHX_RESPONSE_TYPE = 'code';
// const AUTHX_SCOPE = 'openid identi_roles identi_permissions';

// const CLIENT_ID = 'h7ujUq6M56R3mI5cCjkw0XjM';
// const SCOPE = 'openid identi_roles identi_scopes';
// const RESPONSE_TYPE = 'code';
// const REDIRECT_URI = 'https://2b0e2022c8d9.ngrok-free.app/redirect';
// const CLIENT_ID = '454dlIGadcZZ8XLYHqedZNtY';
// const SCOPE = 'openid identi_roles identi_scopes';
// const RESPONSE_TYPE = 'code';
// const REDIRECT_URI = 'http://localhost:3000/redirect';

/**
 * obtener ventas del pos
 * @param dni filtrar ventas por dni
 * @returns
 */
async function launchAuthentication() {
  localStorage.clear();
  const code_verifier = generateRandomString();
  sessionStorage.setItem('code_verifier', code_verifier);
  // localStorage.setItem('code_verifier', code_verifier);
  const code_challenge = await pkce_challenge_from_verifier(code_verifier);
  const NONCE = new Date().getTime();
  const AUTH_URL = `${AUTHX_API}oauth2/authorization?client_id=${AUTHX_CLIENT_ID}&scope=${AUTHX_SCOPE}&response_type=${AUTHX_RESPONSE_TYPE}&redirect_uri=${AUTHX_REDIRECT_URI}&nonce=${NONCE}&code_challenge=${code_challenge}&code_challenge_method=S256`;
  window.open(AUTH_URL, 'identi_auth', 'width=800,height=600');

  // window.addEventListener('message', (event) => {
  //   console.log(event);
  //   if (event.origin !== 'http://localhost:3000') return; // Cambia esto a tu dominio seguro

  //   if (event.data === 'login-exitoso') {
  //     // Redirigir en la ventana principal
  //     window.location.href = 'https://tusitio.com/logged-in';
  //   }
  // });

  //   return apiClient.get(AUTH_URL);s
}

function getToken(code: string) {
  const obj = {
    client_id: AUTHX_CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: AUTHX_REDIRECT_URI,
    code_verifier: sessionStorage.getItem('code_verifier'),
  };
  // const code_verifier = sessionStorage.getItem('code_verifier');
  return apiClient().post('oauth2/token', obj);
}

function exchangeToken(tenant_id: string) {
  const obj = {
    subject_token: localStorage.getItem('token'),
    client_id: AUTHX_CLIENT_ID,
    scope: AUTHX_SCOPE,
    tenant_id: tenant_id,
  };

  return apiClient().post('oauth2/token-exchange', obj);
}

function refreshTokenEntity() {
  const refresh_token = localStorage.getItem('refresh-token');
  return apiClient().post('oauth2/refresh-token', { refresh_token });
  // return apiClient.post('oauth2/refresh-token');
}

function getTenantsOfEntity() {
  return apiClient().get('me/tenants');
}

function getEntity() {
  // const tenant_id = localStorage.getItem('tenant_id');
  return apiClient().get('me');
}

//request init reset password
/**
 * Envía una clave al usuario para el cambio de contraseña
 * @param obj { username: string }
 * @returns
 */
function initResetPassword(username: string) {
  return apiClient().post(
    `oauth2/password/reset?client_id=${AUTHX_CLIENT_ID}`,
    { username },
  );
}

export {
  initResetPassword,
  getEntity,
  launchAuthentication,
  getToken,
  getTenantsOfEntity,
  refreshTokenEntity,
  exchangeToken,
};
