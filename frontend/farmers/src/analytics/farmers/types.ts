export type FarmBaseProps = {
  farm_id: string;
};

export type FarmerBaseProps = {
  farmer_id: string;
};

export type AddFarmerProps = {}; // si agrego un productor, solo recolecto los campos base
export type ViewFarmerProps = FarmerBaseProps; // si veo un productor, recolecto el id del productor como dato del evento
export type ViewFarmsProps = FarmerBaseProps; // si veo las parcelas, recolecto el id del productor como dato del evento
export type ViewPolygonProps = FarmBaseProps; // si veo el polígono, recolecto el id de la parcela como dato del evento
export type DownloadPolygonProps = FarmBaseProps; // si descargo el polígono, recolecto el id de la parcela como dato del evento
export type UploadPolygonProps = FarmBaseProps; // si subo el polígono, recolecto el id de la parcela como dato del evento
export type ViewFormsFarmerProps = FarmerBaseProps; // si veo los formularios dentro del productor, recolecto el id del productor como dato del evento
export type SearchFarmersProps = {}; // si busco productores, solo recolecto los campos base
export type DownloadDeforestationReportProps = FarmBaseProps; // si descargo la información de deforestación, recolecto el id de la parcela como dato del evento
export type UpdateDeforestationStatusProps = {}; // si actualizo el estado de deforestación, solo recolecto los campos base
export type DownloadAllDeforestationReportProps = {}; // si descargo todos los informes de deforestación, solo recolecto los campos base
