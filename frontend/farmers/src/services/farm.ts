import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('farmers');

export const FarmService = {
  uploadFarmGeometry(farm_id: string, data: any) {
    return api().post(`/farms/${farm_id}/geometry`, data);
  },
};
