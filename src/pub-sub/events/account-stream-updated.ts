export type AccountStreamUpdatedEvent = {
  id: string;
  balance: {
    amount: number;
    incoming: number;
    outgoing: number;
  };
  currency: string;
  created: number;
  userId: string;
  updatedAt: string;
};
