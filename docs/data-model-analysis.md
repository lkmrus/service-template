# Data Model and DTO Analysis

This document summarizes the current data model across the major modules and highlights the DTO contracts that feed them. All persisted entities are now managed through Prisma using a SQLite datasource (`prisma/schema.prisma`).

## Users Module
- **Entity:** `User`
  - Fields: `id`, `email` (unique), `password` (hashed), `createdAt`, `updatedAt`.
  - Repository: `PrismaUserRepository` implements `UserRepository` with CRUD operations.
- **DTOs:**
  - `CreateUserDto`: enforces email format and password length ≥ 6.
  - `UpdateUserDto`: optional email/password with the same constraints.
  - `ChangePasswordDto`: requires current password and a new password (≥ 6).

## Orders Module
- **Entities:**
  - `PreOrder`: captures user, seller, product, quantity, currency, commission matrix, calculated totals.
  - `Order`: references an optional pre-order and transaction, stores commission breakdown and status (`paid`, `completed`, `rejected`).
- **Repositories:** `PrismaPreOrderRepository`, `PrismaOrderRepository` provide persistence via `PRE_ORDER_REPOSITORY` and `ORDER_REPOSITORY` tokens.
- **DTOs:**
  - `CreatePreOrderDto`: validates identifiers, quantity ≥ 1, currency, and commission definitions (each entry requires `fix` ≥ 0 and a commission rate expressed as fraction or percentage).

## Transactions Module
- **Entity:** `Transaction` with links to `User`, tracking `amountIn`, `amountOut`, currency, status (`pending`, `completed`, `failed`, `canceled`, `refunded`) and payment method (`balance`, `stripe`).
- **Repository:** `PrismaTransactionRepository` implements `TransactionRepository` and is used by `TransactionsService` for create/find/update flows.
- **DTOs:** (presentation controller is currently empty; service is consumed by other modules).

## Billing Module
- **Entities:**
  - `Customer`: maps users to gateway customer IDs.
  - `Plan`: stores pricing metadata (`planId`, `name`, `description`, `price`, `currency`, `interval`).
  - `Subscription`: links customers to plans with status (`active`, `canceled`, `past_due`) and billing dates.
  - `Invoice` & `Payment`: track downstream invoicing lifecycle.
  - `Balance`: aggregates debits/credits per user.
- **Repositories:** Prisma-backed repositories exist for each domain object and are registered in `BillingModule` (e.g., `PrismaCustomerRepository`, `PrismaPlanRepository`, `PrismaSubscriptionRepository`, etc.).
- **DTOs:**
  - `CreateSubscriptionDto`: requires `userId`, `planId`, and `preOrderId`.

## Auth Module
- Relies on `UsersService` for lookups; DTO handling is delegated to Passport strategies (no explicit class-validator DTOs).

## Shared Validation & Persistence Notes
- Prisma migrations:
  - `20250917025125_init`: initial schema (users, orders, transactions, billing tables).
  - `20250917032704_align_names`: aligned table columns with domain naming (e.g., `planId`, `subscriptionId`).
- DTOs now mirror persisted attributes to avoid runtime drift between API contracts and storage schema.
