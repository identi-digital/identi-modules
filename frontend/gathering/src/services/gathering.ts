import { getModuleApi } from '@/core/apiRegistry';
const api = () => getModuleApi('gathering');

export const GatheringService = {
  getLotsPaginate(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
    status: string,
    gathering_center_id?: string,
    current_store_center_id?: string,
  ) {
    let url =
      '/lots?page=' +
      page +
      '&per_page=' +
      per_page +
      '&sort_by=' +
      sort_by +
      '&order=' +
      order +
      '&search=' +
      search +
      '&status=' +
      status;
    if (gathering_center_id) {
      url += '&gathering_center_id=' + gathering_center_id;
    }
    if (current_store_center_id) {
      url += '&current_store_center_id=' + current_store_center_id;
    }
    return api().get(url);
  },
  getGatheringCentersPaginate(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/gathering-centers?page=' +
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

  getGatherersOfGatheringCenter(
    gathering_center_id: string,
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      `/gatherers/by-gathering-center/${gathering_center_id}?page=` +
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

  getGatheringSummary(gathering_center_id?: string) {
    let str = '/gathering-centers/summary';
    console.log(gathering_center_id);
    if (gathering_center_id && gathering_center_id !== '') {
      str = `/gathering-centers/summary?gathering_center_id=${gathering_center_id}`;
    }
    return api().get(str);
  },

  getGatheringCentersExport() {
    return api().getFile('/gathering-centers/export/excel');
  },
  getGatherersExport(gathering_center_id?: string) {
    return api().getFile(
      `/gatherers/by-gathering-center/${gathering_center_id}/export/excel`,
    );
  },

  getBalancesExport(
    gathering_center_id: string,
    type_movement?: 'purchase' | 'recharge',
    gatherer_id?: string,
  ) {
    let url = `/balances/export/excel?gathering_center_id=${gathering_center_id}`;
    if (type_movement) {
      url += '&type_movement=' + type_movement;
    }
    if (gatherer_id) {
      url += '&gatherer_id=' + gatherer_id;
    }
    return api().getFile(url);
  },

  getLotsExport(
    type_download: 'lots' | 'purchases' = 'lots',
    sort_by: string = 'created_at',
    order: string = 'desc',
    search: string = '',
    status: string = 'activo',
    gathering_center_id?: string,
    current_store_center_id?: string,
  ) {
    let url = '/lots/export/excel?type_download=' + type_download;
    if (gathering_center_id) {
      url += '&gathering_center_id=' + gathering_center_id;
    }
    if (current_store_center_id) {
      url += '&current_store_center_id=' + current_store_center_id;
    }
    url +=
      '&sort_by=' +
      sort_by +
      '&order=' +
      order +
      '&search=' +
      search +
      '&status=' +
      status;
    return api().getFile(url);
  },

  getById(id: string) {
    return api().get(`/detail/${id}`);
  },

  create(data: any) {
    return api().post('/', data);
  },

  getSchemaById(schema_id: string) {
    return api().get(`/schema-forms/${schema_id}`);
  },

  disableGathererOfGatheringCenter(relation_id: string) {
    return api().delete(`/gatherer-gathering-centers/${relation_id}`);
  },
};
