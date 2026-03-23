export type GatheringBaseProps = {
  gathering_id: string;
};

export type DownloadGatheringDataProps = {}; // descargo la información de acopio
export type AssignBalanceToGatheringProps = GatheringBaseProps; // asigno el saldo al centro de acopio
export type AddGathererProps = GatheringBaseProps; // agrego un técnico comercial
export type ViewGatheringCenterProps = GatheringBaseProps; // veo el centro de acopio
export type DownloadGatheringCenterProps = {
  type_download:
    | 'lotes activos'
    | 'lotes en stock'
    | 'lotes despachados'
    | 'lotes eliminados'
    | 'movimientos de caja'
    | 'técnicos comerciales';
} & GatheringBaseProps; // descargo la información del centro de acopio
export type StockLotsProps = GatheringBaseProps; // veo los lotes en stock
export type DispatchLotsProps = GatheringBaseProps; // veo los lotes despachados
export type DeletedLotsProps = GatheringBaseProps; // veo los lotes eliminados
export type GatherersViewProps = GatheringBaseProps; // veo los técnicos comerciales
export type BalancesViewProps = GatheringBaseProps; // veo los movimientos de caja
