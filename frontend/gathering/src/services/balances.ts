import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('gathering');

export const BalanceService = {
  create(data: any) {
    return api().post('/balances', data);
  },
  getBalances(
    page: number,
    page_size: number,
    gathering_center_id?: string,
    gatherer_id?: string,
    type_movement?: 'recharge' | 'purchase',
  ) {
    let str = `/balances?page=` + page + `&per_page=` + page_size;
    if (gathering_center_id && gathering_center_id !== '') {
      str += `&gathering_center_id=${gathering_center_id}`;
    }
    if (gatherer_id && gatherer_id !== '') {
      str += `&gatherer_id=${gatherer_id}`;
    }
    if (type_movement) {
      str += `&type_movement=${type_movement}`;
    }
    return api().get(str);
  },
};
