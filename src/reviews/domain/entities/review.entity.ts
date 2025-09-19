export class Review {
  id: string;
  productId: string;
  userId: string;
  review: string;
  orderId?: string;
  rate: number;
  lang: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
