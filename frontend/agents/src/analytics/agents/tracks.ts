import { analytics } from '@/core/analytics/client';
import { AgentEvents } from './events';
import {
  AddAgentProps,
  SearchAgentsProps,
  FilterStatusAgentsProps,
} from './types';

const MODULE = 'agents';

export const trackAddAgent = (props: AddAgentProps) => {
  analytics.track(AgentEvents.ADD_AGENT, {
    ...props,
    module: MODULE,
    action: AgentEvents.ADD_AGENT,
  });
};

export const trackSearchAgents = (props: SearchAgentsProps) => {
  analytics.track(AgentEvents.SEARCH_AGENTS, {
    ...props,
    module: MODULE,
    action: AgentEvents.SEARCH_AGENTS,
  });
};

export const trackFilterStatusAgents = (props: FilterStatusAgentsProps) => {
  analytics.track(AgentEvents.FILTER_STATUS_AGENTS, {
    ...props,
    module: MODULE,
    action: AgentEvents.FILTER_STATUS_AGENTS,
  });
};
