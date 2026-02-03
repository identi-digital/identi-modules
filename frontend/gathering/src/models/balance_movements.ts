import { Gatherer } from './gatherer';

export enum MovementType {
  PURCHASE = 'purchase',
  RECHARGE = 'recharge',
}

export interface BalanceMovement {
  id: string;
  gathering_center_id: string;
  gatherer_id?: string;
  type_movement: MovementType;
  purchase_id?: string;
  ammount: number;
  identity_id: string;
  created_at: string;
  disabled_at?: string;
}
export interface BalanceMovementCreate {
  gathering_center_id: string;
  gatherer_id?: string;
  type_movement: MovementType;
  purchase_id?: string;
  ammount: number;
  identity_id: string;
  created_at: string;
}

export interface GatheringCenter {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface Identity {
  id: string;
  sub: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface BalanceMovementList extends BalanceMovement {
  gathering_center: GatheringCenter;
  gatherer: Gatherer;
  identity: Identity;
}
