import { getModuleApi } from '@/core/apiRegistry';

const api = () => getModuleApi('auth');

export const AuthService = {
  login(credentials: { email: string; password: string }) {
    return api().post('/login', credentials);
  },

  logout() {
    return api().post('/logout');
  },

  me() {
    return api().get('/me');
  },

  getIdentityByEid(eid: string) {
    return api().get(`/identities/by-eid/${eid}`);
  },
};
