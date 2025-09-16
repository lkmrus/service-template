export class Balance {
  userId: string;
  amountIn: number;
  amountOut: number;

  get balance(): number {
    return this.amountIn - this.amountOut;
  }
}
