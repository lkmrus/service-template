export class SubscriptionStatusChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly plan: string,
  ) {}
}
