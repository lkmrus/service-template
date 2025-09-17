export interface CommissionRateShape {
  /**
   * Commission percentage in the 1-100 range. Optional when fraction provided.
   */
  percentage?: number;
  /**
   * Decimal representation (e.g. 0.05 → 5%). Optional when percentage provided.
   */
  fraction?: number;
}

export interface CommissionDefinition {
  fix: number;
  commissionRate: CommissionRateShape;
}

export type CommissionMatrix = Record<string, CommissionDefinition>;

export interface CalculatedCommission {
  fix: number;
  percentageAmount: number;
  total: number;
}
