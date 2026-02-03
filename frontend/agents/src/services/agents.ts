import { getModuleApi } from '@/core/apiRegistry';
import { AgentCreate } from '../models/agent';

const api = () => getModuleApi('agents');

export const AgentsService = {
  getAgentsPaginate(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/?page=' +
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

  postCreateAgent(gatherer: AgentCreate) {
    return api().post('/', gatherer);
  },
};
