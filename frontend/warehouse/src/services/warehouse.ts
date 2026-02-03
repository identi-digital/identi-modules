import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('warehouse');

export const WarehouseService = {
  getWarehousesPaginate(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/store-centers?page=' +
        page +
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
  getWarehousesExport() {
    return api().getFile('/store-centers/export/excel');
  },
  getWarehouseSummary(store_center_id?: string) {
    let str = '/summary';
    if (store_center_id && store_center_id !== '') {
      str = `/summary?store_center_id=${store_center_id}`;
    }
    return api().get(str);
  },
  disableStoreCenter(store_center_id: string) {
    return api().delete(`/store-centers/${store_center_id}`);
  },
  restoreStoreCenter(store_center_id: string) {
    return api().post(`/store-centers/${store_center_id}/restore`);
  },
};
