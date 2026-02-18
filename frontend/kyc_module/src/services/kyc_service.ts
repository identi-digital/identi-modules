import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('prospection');

export const KycService = {
  getAll() {
    return api().get('/kyc-results');
  },
};
