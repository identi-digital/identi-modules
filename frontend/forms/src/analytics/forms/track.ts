import { analytics } from '@/core/analytics/client';
import { FormEvents } from './events';
import {
  CreateFormProps,
  EditFormProps,
  SearchFormsProps,
  ViewFormProps,
  AddRecordProps,
} from './types';

const MODULE = 'forms';

export const trackCreateForm = (props: CreateFormProps) => {
  analytics.track(FormEvents.CREATE_FORM, {
    ...props,
    module: MODULE,
    action: FormEvents.CREATE_FORM,
  });
};

export const trackEditForm = (props: EditFormProps) => {
  analytics.track(FormEvents.EDIT_FORM, {
    ...props,
    module: MODULE,
    action: FormEvents.EDIT_FORM,
  });
};

export const trackSearchForms = (props: SearchFormsProps) => {
  analytics.track(FormEvents.SEARCH_FORMS, {
    ...props,
    module: MODULE,
    action: FormEvents.SEARCH_FORMS,
  });
};

export const trackViewForm = (props: ViewFormProps) => {
  analytics.track(FormEvents.VIEW_FORM, {
    ...props,
    module: MODULE,
    action: FormEvents.VIEW_FORM,
  });
};

export const trackAddRecord = (props: AddRecordProps) => {
  analytics.track(FormEvents.ADD_RECORD, {
    ...props,
    module: MODULE,
    action: FormEvents.ADD_RECORD,
  });
};

export const trackDownloadFormRecords = (props: AddRecordProps) => {
  analytics.track(FormEvents.DOWNLOAD_FORM_RECORDS, {
    ...props,
    module: MODULE,
    action: FormEvents.DOWNLOAD_FORM_RECORDS,
  });
};
