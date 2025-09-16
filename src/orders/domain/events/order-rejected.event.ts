export class OrderRejectedEvent {
  constructor(
    public readonly orderId: string,
    public readonly transactionId: string,
  ) {}
}
