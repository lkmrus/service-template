# Transaction Statuses and Lifecycle

This document describes the lifecycle of a transaction and the meaning of each status.

## Statuses

*   **PENDING:** The initial status of a transaction. The transaction has been created but is not yet completed. This is the status for transactions that are awaiting payment confirmation from a third-party provider.

*   **COMPLETED:** The transaction has been successfully completed. The payment has been confirmed, and the funds have been transferred.

*   **FAILED:** The transaction has failed. The payment was not confirmed, or an error occurred during the process.

*   **CANCELED:** The transaction has been canceled by the user or the system.

*   **REFUNDED:** The transaction has been refunded. The funds have been returned to the user.

## Lifecycle

A typical transaction lifecycle for a payment with an external provider like Stripe is as follows:

1.  A transaction is created with the status `PENDING`.
2.  The user is redirected to the payment provider's page to complete the payment.
3.  The payment provider sends a webhook to our system with the payment status.
4.  If the payment is successful, the transaction status is updated to `COMPLETED`.
5.  If the payment fails, the transaction status is updated to `FAILED`.
6.  If the user cancels the payment, the transaction status is updated to `CANCELED`.

A transaction can be `REFUNDED` at a later stage, after it has been `COMPLETED`.

## Scenarios

### Full Payment via External Method (e.g., Stripe)

1.  Create a `CREDIT` transaction for the user's balance with the status `PENDING` and the payment method `STRIPE`.
2.  Upon successful payment confirmation from Stripe, update the transaction status to `COMPLETED`.
3.  Create a `DEBIT` transaction from the user's balance to the service account with the status `COMPLETED` and the payment method `BALANCE`.

### Full Payment from User's Balance

1.  Create a `DEBIT` transaction from the user's balance to the service account with the status `COMPLETED` and the payment method `BALANCE`.

### Partial Payment (Balance + External Method)

1.  Create a `DEBIT` transaction for the amount to be paid from the user's balance with the status `COMPLETED` and the payment method `BALANCE`.
2.  Create a `CREDIT` transaction for the remaining amount to be paid with the external provider with the status `PENDING` and the payment method `STRIPE`.
3.  Upon successful payment confirmation from Stripe, update the `CREDIT` transaction status to `COMPLETED`.
4.  Create a `DEBIT` transaction for the total amount from the user's balance to the service account with the status `COMPLETED` and the payment method `BALANCE`.
