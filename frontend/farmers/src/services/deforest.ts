import { getServiceApi } from '@/core/apiRegistry';
const api = () => getServiceApi('deforesting');

export const DeforestService = {
  paginateFarmsDeforest(
    page: number,
    per_page: number,
    status: 'baja/nula' | 'parcial' | 'crítica',
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/farms?page=' +
        page +
        '&per_page=' +
        per_page +
        '&status=' +
        status +
        '&sort_by=' +
        sort_by +
        '&order=' +
        order +
        '&search=' +
        search,
    );
  },
  getGeoreferenceMetrics() {
    return api().get('/farms/georeference-metrics');
  },
  getFarmsMetrics() {
    return api().get('/farms/metrics');
  },
  getFarmerMetrics() {
    return api().get('/farmers/metrics');
  },
  getFarmsDeforestExport() {
    return api().getFile('/farms/export/excel');
  },
};
