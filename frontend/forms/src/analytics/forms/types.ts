export type FormBaseProps = {
  form_id: string;
};

export type CreateFormProps = {}; // si agrego un formulario, solo recolecto los campos base
export type EditFormProps = FormBaseProps; // si edita un formulario, solo recolecto los campos base
export type SearchFormsProps = {}; // si busco formularios, solo recolecto los campos base
export type ViewFormProps = FormBaseProps; // si veo un formulario, recolecto el id del formulario como dato del evento
export type AddRecordProps = FormBaseProps; // si agrego un registro, solo recolecto los campos base
export type DownloadFormRecordsProps = FormBaseProps; // si descargo los registros, solo recolecto los campos base
