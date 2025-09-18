export type CartChangedEvent = {
  id?: string | number;
  ownerId?: string;
  authorId?: string;
  couponCode?: string;
  lineItems?: any[];
};
