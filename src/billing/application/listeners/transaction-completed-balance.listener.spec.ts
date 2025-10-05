import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionsService } from '../../../transactions/application/transactions/transactions.service';
import { BalanceRepository } from '../../domain/repositories/balance.repository';
import { TransactionCompletedBalanceListener } from './transaction-completed-balance.listener';

describe('TransactionCompletedBalanceListener', () => {
  let listener: TransactionCompletedBalanceListener;
  let transactionsService: TransactionsService;
  let balanceRepository: BalanceRepository;
  let findOneMock: jest.Mock;
  let upsertMock: jest.Mock;

  beforeEach(() => {
    findOneMock = jest.fn();
    upsertMock = jest.fn();

    transactionsService = {
      findOne: findOneMock,
    } as unknown as TransactionsService;

    balanceRepository = {
      findByUserId: jest.fn(),
      upsert: upsertMock,
    } as unknown as BalanceRepository;

    listener = new TransactionCompletedBalanceListener(
      transactionsService,
      balanceRepository,
    );
  });

  it('updates balance using transaction amounts', async () => {
    const transaction = {
      id: 'tx-1',
      userId: 'user-1',
      amountIn: 50,
      amountOut: 20,
      currency: 'USD',
    } as Transaction;

    findOneMock.mockResolvedValue(transaction);

    await listener.handleTransactionCompletedEvent({ transactionId: 'tx-1' });

    expect(findOneMock).toHaveBeenCalledWith('tx-1');
    expect(upsertMock).toHaveBeenCalledWith('user-1', 50, 20);
  });

  it('defaults missing amounts to zero', async () => {
    const transaction = {
      id: 'tx-2',
      userId: 'user-2',
      amountIn: undefined,
      amountOut: undefined,
      currency: 'EUR',
    } as unknown as Transaction;

    findOneMock.mockResolvedValue(transaction);

    await listener.handleTransactionCompletedEvent({ transactionId: 'tx-2' });

    expect(upsertMock).toHaveBeenCalledWith('user-2', 0, 0);
  });

  it('remains idempotent when handling the same event multiple times', async () => {
    const transaction = {
      id: 'tx-3',
      userId: 'user-3',
      amountIn: 10,
      amountOut: 5,
      currency: 'GBP',
    } as Transaction;

    findOneMock.mockResolvedValue(transaction);

    await listener.handleTransactionCompletedEvent({ transactionId: 'tx-3' });
    await listener.handleTransactionCompletedEvent({ transactionId: 'tx-3' });

    expect(upsertMock).toHaveBeenCalledTimes(2);
    expect(upsertMock).toHaveBeenNthCalledWith(1, 'user-3', 10, 5);
    expect(upsertMock).toHaveBeenNthCalledWith(2, 'user-3', 10, 5);
  });
});
