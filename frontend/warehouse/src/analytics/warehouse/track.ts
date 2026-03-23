import { analytics } from '@/core/analytics/client';
import { WarehouseEvents } from './events';
import { DownloadWarehouseDataProps, ViewWarehouseCenterProps } from './types';

const MODULE = 'warehouse';

export const trackDownloadWarehouseData = (
  props: DownloadWarehouseDataProps,
) => {
  analytics.track(WarehouseEvents.DOWNLOAD_WAREHOUSE_DATA, {
    ...props,
    module: MODULE,
    action: WarehouseEvents.DOWNLOAD_WAREHOUSE_DATA,
  });
};

export const trackViewWarehouseCenter = (props: ViewWarehouseCenterProps) => {
  analytics.track(WarehouseEvents.VIEW_WAREHOUSE_CENTER, {
    ...props,
    module: MODULE,
    action: WarehouseEvents.VIEW_WAREHOUSE_CENTER,
  });
};
