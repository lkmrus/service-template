export interface CommissionDefinition {
  fix: number;
  commissionRate: number;
}

export type CommissionMatrix = Record<string, CommissionDefinition>;

export interface CalculatedCommission {
  fix: number;
  percentageAmount: number;
  total: number;
}
