import { analytics } from '@/core/analytics/client';
import { FarmEvents } from './events';
import {
  FarmViewPolygonProps,
  FarmEditProps,
  FarmDownloadPolygonProps,
  FarmUploadPolygonProps,
  FarmDownloadDeforestationReportProps,
} from './types';

export const trackFarmViewPolygon = (props: FarmViewPolygonProps) => {
  analytics.track(FarmEvents.VIEW_POLYGON, {
    ...props,
    module: 'farmers',
    action: 'view_polygon',
  });
};

export const trackFarmEdit = (props: FarmEditProps) => {
  analytics.track(FarmEvents.EDIT, {
    ...props,
    module: 'farmers',
    action: 'edit',
  });
};

export const trackFarmDownloadPolygon = (props: FarmDownloadPolygonProps) => {
  analytics.track(FarmEvents.DOWNLOAD_POLYGON, {
    ...props,
    module: 'farmers',
    action: 'download_polygon',
  });
};

export const trackFarmUploadPolygon = (props: FarmUploadPolygonProps) => {
  analytics.track(FarmEvents.UPLOAD_POLYGON, {
    ...props,
    module: 'farmers',
    action: 'upload_polygon',
  });
};

export const trackFarmDownloadDeforestationReport = (
  props: FarmDownloadDeforestationReportProps,
) => {
  analytics.track(FarmEvents.DOWNLOAD_DEFORESTATION_REPORT, {
    ...props,
    module: 'farmers',
    action: 'download_deforestation_report',
  });
};
