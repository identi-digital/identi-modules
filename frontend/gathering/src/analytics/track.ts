import { analytics } from '@/core/analytics/client';
import { GatheringEvents } from './events';
import {
  DownloadGatheringDataProps,
  AssignBalanceToGatheringProps,
  AddGathererProps,
  ViewGatheringCenterProps,
  DownloadGatheringCenterProps,
  StockLotsProps,
  DispatchLotsProps,
  DeletedLotsProps,
  GatherersViewProps,
  BalancesViewProps,
} from './types';

const MODULE = 'gathering';

export const trackDownloadGatheringData = (
  props: DownloadGatheringDataProps,
) => {
  analytics.track(GatheringEvents.DOWNLOAD_GATHERING_DATA, {
    ...props,
    module: MODULE,
    action: GatheringEvents.DOWNLOAD_GATHERING_DATA,
  });
};

export const trackAssignBalanceToGathering = (
  props: AssignBalanceToGatheringProps,
) => {
  analytics.track(GatheringEvents.ASSIGN_BALANCE_TO_GATHERING, {
    ...props,
    module: MODULE,
    action: GatheringEvents.ASSIGN_BALANCE_TO_GATHERING,
  });
};

export const trackAddGatherer = (props: AddGathererProps) => {
  analytics.track(GatheringEvents.ADD_GATHERER, {
    ...props,
    module: MODULE,
    action: GatheringEvents.ADD_GATHERER,
  });
};

export const trackViewGatheringCenter = (props: ViewGatheringCenterProps) => {
  analytics.track(GatheringEvents.VIEW_GATHERING_CENTER, {
    ...props,
    module: MODULE,
    action: GatheringEvents.VIEW_GATHERING_CENTER,
  });
};

export const trackDownloadGatheringCenter = (
  props: DownloadGatheringCenterProps,
) => {
  analytics.track(GatheringEvents.DOWNLOAD_GATHERING_CENTER, {
    ...props,
    module: MODULE,
    action: GatheringEvents.DOWNLOAD_GATHERING_CENTER,
  });
};

export const trackStockLots = (props: StockLotsProps) => {
  analytics.track(GatheringEvents.STOCK_LOTS, {
    ...props,
    module: MODULE,
    action: GatheringEvents.STOCK_LOTS,
  });
};

export const trackDispatchLots = (props: DispatchLotsProps) => {
  analytics.track(GatheringEvents.DISPATCH_LOTS, {
    ...props,
    module: MODULE,
    action: GatheringEvents.DISPATCH_LOTS,
  });
};

export const trackDeletedLots = (props: DeletedLotsProps) => {
  analytics.track(GatheringEvents.DELETED_LOTS, {
    ...props,
    module: MODULE,
    action: GatheringEvents.DELETED_LOTS,
  });
};

export const trackGatherersView = (props: GatherersViewProps) => {
  analytics.track(GatheringEvents.GATHERERS_VIEW, {
    ...props,
    module: MODULE,
    action: GatheringEvents.GATHERERS_VIEW,
  });
};

export const trackBalancesView = (props: BalancesViewProps) => {
  analytics.track(GatheringEvents.BALANCES_VIEW, {
    ...props,
    module: MODULE,
    action: GatheringEvents.BALANCES_VIEW,
  });
};
