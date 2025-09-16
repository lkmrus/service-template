export class Plan {
  planId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
}
