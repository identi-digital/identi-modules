import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('farmers');
const formsApi = () => getModuleApi('forms');
export const FarmerService = {
  getAll(
    page: number,
    perPage: number,
    sortBy: string,
    order: string,
    search: string,
    status: string,
  ) {
    return api().get(
      '/?page=' +
        page +
        '&per_page=' +
        perPage +
        '&sort_by=' +
        sortBy +
        '&order=' +
        order +
        '&search=' +
        search +
        '&status=' +
        status,
    );
  },
  getById(id: string) {
    return api().get(`/${id}`);
  },

  getPlotsByFarmerId(id: string) {
    return api().get(`/${id}/plots`);
  },
  getFarmsByFarmerId(id: string, page: number, pageSize: number) {
    return api().get(`/${id}/farms?page=${page}&page_size=${pageSize}`);
  },

  getFarmersRegisters(
    id: string,
    page: number,
    perPage: number,
    sortBy: string,
    order: string,
    search: string,
  ) {
    return api().get(
      `/${id}/registers?page=${page}&per_page=${perPage}&sort_by=${sortBy}&order=${order}&search=${search}`,
    );
  },

  getFarmersMentionsRegisters(
    id: string,
    page: number,
    perPage: number,
    sortBy: string,
    order: string,
    search: string,
  ) {
    return formsApi().get(
      `/entities/${id}/mentions?page=${page}&per_page=${perPage}&sort_by=${sortBy}&order=${order}&search=${search}`,
    );
  },
};
