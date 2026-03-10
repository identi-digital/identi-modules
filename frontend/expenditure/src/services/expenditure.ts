import { getServiceApi } from '@/core/apiRegistry';
const api = () => getServiceApi('poc_ramp');

export const ExpenditureService = {
  getTransfers(
    // status: 'TO_DO' | 'PENDING' | 'COMPLETED' | 'FAILED',
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/transfers?page=' +
        page +
        // '&status=' +
        // status +
        '&per_page=' +
        per_page +
        '&sort_by=' +
        sort_by +
        '&order=' +
        order +
        '&search=' +
        search,
    );
  },
  createTransfer(data: any) {
    return api().post('/transfers/create', data);
  },
};
