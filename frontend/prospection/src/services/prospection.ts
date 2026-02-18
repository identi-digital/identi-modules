import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('prospection');

export const ProspectionService = {
  getMetrics() {
    return api().get('/metrics');
  },
  getPolygonsByFormId(form_id: string) {
    return api().get(`/${form_id}`);
  },
};
