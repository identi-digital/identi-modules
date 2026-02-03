import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('gathering');

export const BalanceService = {
  create(data: any) {
    return api().post('/balances', data);
  },
  getBalances(
    gathering_id?: string,
    gatherer_id?: string,
    type?: 'recharge' | 'purchase',
  ) {
    let str = `/balances`;
    if (gathering_id && gathering_id !== '') {
      str += `?gathering_id=${gathering_id}`;
    }
    if (gatherer_id && gatherer_id !== '') {
      str += `&gatherer_id=${gatherer_id}`;
    }
    if (type) {
      str += `&type=${type}`;
    }
    return api().get(str);
  },
};
