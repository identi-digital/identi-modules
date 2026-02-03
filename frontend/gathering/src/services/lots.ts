import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('gathering');

interface LotDispatch {
  lot_ids: string[];
  store_center_id: string;
}

export const LotService = {
  disableLot(lot_id: string) {
    return api().delete(`/lots/${lot_id}`);
  },
  restoreLot(lot_id: string) {
    return api().post(`/lots/${lot_id}/restore`);
  },

  patchLot(lot_id: string, data: any) {
    return api().patch(`/lots/${lot_id}`, data);
  },

  dispatchLots(data: LotDispatch) {
    return api().post('/lots/dispatch', data);
  },
};
