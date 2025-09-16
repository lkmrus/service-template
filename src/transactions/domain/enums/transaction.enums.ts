export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  BALANCE = 'balance',
  STRIPE = 'stripe',
}
