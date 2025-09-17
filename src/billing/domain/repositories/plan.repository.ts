import { Plan } from '../entities/plan.entity';

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export interface CreatePlanRecord {
  planId?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface PlanRepository {
  findById(planId: string): Promise<Plan | undefined>;
  create(data: CreatePlanRecord): Promise<Plan>;
  list(): Promise<Plan[]>;
}
