import { analytics } from '@/core/analytics/client';
import { FarmerEvents } from './events';
import {
  AddFarmerProps,
  ViewFarmerProps,
  ViewFarmsProps,
  ViewPolygonProps,
  DownloadPolygonProps,
  UploadPolygonProps,
  ViewFormsFarmerProps,
  SearchFarmersProps,
  DownloadDeforestationReportProps,
  UpdateDeforestationStatusProps,
  DownloadAllDeforestationReportProps,
} from './types';

const MODULE = 'farmers';

export const trackAddFarmer = (props: AddFarmerProps) => {
  analytics.track(FarmerEvents.ADD_FARMER, {
    ...props,
    module: MODULE,
    action: FarmerEvents.ADD_FARMER,
  });
};

export const trackViewFarmer = (props: ViewFarmerProps) => {
  analytics.track(FarmerEvents.VIEW_FARMER, {
    ...props,
    module: MODULE,
    action: FarmerEvents.VIEW_FARMER,
  });
};

export const trackViewFarms = (props: ViewFarmsProps) => {
  analytics.track(FarmerEvents.VIEW_FARMS, {
    ...props,
    module: MODULE,
    action: FarmerEvents.VIEW_FARMS,
  });
};

export const trackViewPolygon = (props: ViewPolygonProps) => {
  analytics.track(FarmerEvents.VIEW_POLYGON, {
    ...props,
    module: MODULE,
    action: FarmerEvents.VIEW_POLYGON,
  });
};

export const trackDownloadPolygon = (props: DownloadPolygonProps) => {
  analytics.track(FarmerEvents.DOWNLOAD_POLYGON, {
    ...props,
    module: MODULE,
    action: FarmerEvents.DOWNLOAD_POLYGON,
  });
};

export const trackUploadPolygon = (props: UploadPolygonProps) => {
  analytics.track(FarmerEvents.UPLOAD_POLYGON, {
    ...props,
    module: MODULE,
    action: FarmerEvents.UPLOAD_POLYGON,
  });
};

export const trackViewFormsFarmer = (props: ViewFormsFarmerProps) => {
  analytics.track(FarmerEvents.VIEW_FORMS_FARMER, {
    ...props,
    module: MODULE,
    action: FarmerEvents.VIEW_FORMS_FARMER,
  });
};

export const trackSearchFarmers = (props: SearchFarmersProps) => {
  analytics.track(FarmerEvents.SEARCH_FARMERS, {
    ...props,
    module: MODULE,
    action: FarmerEvents.SEARCH_FARMERS,
  });
};

export const trackDownloadDeforestationReport = (
  props: DownloadDeforestationReportProps,
) => {
  analytics.track(FarmerEvents.DOWNLOAD_DEFORESTATION_REPORT, {
    ...props,
    module: MODULE,
    action: FarmerEvents.DOWNLOAD_DEFORESTATION_REPORT,
  });
};

export const trackUpdateDeforestationStatus = (
  props: UpdateDeforestationStatusProps,
) => {
  analytics.track(FarmerEvents.UPDATE_DEFORESTATION_STATUS, {
    ...props,
    module: MODULE,
    action: FarmerEvents.UPDATE_DEFORESTATION_STATUS,
  });
};

export const trackDownloadAllDeforestationReport = (
  props: DownloadAllDeforestationReportProps,
) => {
  analytics.track(FarmerEvents.DOWNLOAD_ALL_DEFORESTATION_REPORT, {
    ...props,
    module: MODULE,
    action: FarmerEvents.DOWNLOAD_ALL_DEFORESTATION_REPORT,
  });
};
