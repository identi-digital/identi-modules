import { getModuleApi, getServiceApi } from '@/core/apiRegistry';
const api = () => getModuleApi('forms');
const planeApi = () => getServiceApi('plane');

export const FormService = {
  // tools
  getTools(
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return api().get(
      '/tools?page=' +
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
  // forms
  getAll() {
    return api().get('/forms');
  },

  getById(id: string) {
    return api().get(`/forms/${id}`);
  },
  createForm(data: any) {
    return api().post('/forms', data);
  },
  updateForm(id: string, data: any) {
    return api().put(`/forms/${id}`, data);
  },

  validateUniqueField(data: any) {
    return api().post('/validate-unique-field', data);
  },

  getListEntities(
    entity_name: string,
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
  ) {
    return planeApi().get(
      entity_name +
        '?page=' +
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

  getListEntitiesData(
    entity_name: string,
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
    representative_value: string,
    filter: string,
  ) {
    return api().get(
      '/entities/' +
        entity_name +
        '/data' +
        '?page=' +
        page +
        '&per_page=' +
        per_page +
        '&sort_by=' +
        sort_by +
        '&order=' +
        order +
        '&search=' +
        search +
        '&representative_value=' +
        representative_value +
        '&filter=' +
        filter,
    );
  },

  createRegister(data: any) {
    return api().post('/registers', data);
  },

  getRegistersByFormId(
    form_id: string,
    page: number,
    per_page: number,
    sort_by: string,
    order: string,
    search: string,
    start_date?: string,
    end_date?: string,
  ) {
    return api().get(
      `/forms/${form_id}/registers?&page=` +
        page +
        '&per_page=' +
        per_page +
        '&sort_by=' +
        sort_by +
        '&order=' +
        order +
        '&search=' +
        search +
        '&start_date=' +
        start_date +
        '&end_date=' +
        end_date,
    );
  },

  // schemas
  createFormSchema(form_id: string, data: any) {
    return api().post('/forms/' + form_id + '/schema', data);
  },

  exportFormsToExcel(
    form_id: string,
    sort_by: string,
    order: string,
    search: string,
    start_date: string,
    end_date: string,
    max_file_size_mb: number,
  ) {
    return api().getFile(
      '/forms/' +
        form_id +
        '/registers/export/excel?sort_by=' +
        sort_by +
        '&order=' +
        order +
        '&search=' +
        search +
        '&start_date=' +
        start_date +
        '&end_date=' +
        end_date +
        '&max_file_size_mb=' +
        max_file_size_mb,
      {
        responseType: 'blob', // 🔥 CLAVE
      },
    );
  },
};
