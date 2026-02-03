import { getModuleApi } from '@/core/apiRegistry';
import { GathererCreate } from '../models/gatherer';
const api = () => getModuleApi('gathering');

export const GatherersService = {
  getGatherersPaginate(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
    status: string,
    isDisabled?: boolean,
  ) {
    return api().get(
      '/gatherers?page=' +
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
        status +
        '&is_disabled=' +
        isDisabled,
    );
  },

  assignGathererToGatheringCenter(
    gatherer_id: string,
    gathering_center_id: string,
  ) {
    return api().post(`/gatherer-gathering-centers`, {
      gatherer_id,
      gathering_center_id,
    });
  },

  createGatherer(gatherer: GathererCreate) {
    return api().post('/gatherers', gatherer);
  },

  getGatherersResume(gatherer_id?: string) {
    let str = `/balances/gatherers/summary`;
    if (gatherer_id) {
      str += `?gatherer_id=${gatherer_id}`;
    }
    return api().get(str);
  },

  disableGatherer(gatherer_id: string) {
    return api().delete(`/gatherers/${gatherer_id}`);
  },

  restoreGatherer(gatherer_id: string) {
    return api().post(`/gatherers/${gatherer_id}/restore`);
  },
};
