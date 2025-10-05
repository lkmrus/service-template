# service-template
Nest.js-based API for a quick MVP start

## Description
Its classic NestJS project structure with modules, services, controllers, and repositories. It uses Prisma as ORM and supports Supabase as an alternative data provider. The application includes REST and GraphQL APIs, authentication, authorization, and background job processing with BullMQ.

### GraphQL surface

REST endpoints now have GraphQL counterparts exposed under `/gql`.

**Queries**
- `graphqlHealth`: basic readiness probe.
- `products`: list all products.
- `productById(id: String!)`: fetch a product by database id.
- `productBySlug(slug: String!)`: fetch a product by slug.
- `reviews`: list all reviews.
- `reviewsByProduct(productId: String!)`: list reviews for a product.
- `reviewById(id: String!)`: fetch a review by id.
- `cart(filter?: CartFilterInput)`: fetch the active cart by id or owner (falls back to the authenticated user).
- `cartItemsCount(filter?: CartFilterInput)`: return the number of line items (including nested bundle items) in the resolved cart.

**Mutations**
- `login(input: LoginInput!)`: exchange email/password for a JWT access token.
- `registerUser(input: RegisterUserInput!)`: create a new user record.
- `updateUser(id: String!, input: UpdateUserInput!)`: super-admin only.
- `deleteUser(id: String!)`: super-admin only.
- `changePassword(id: String!, input: ChangePasswordInput!)`: requires JWT for the same user.
- `createProduct(input: CreateProductInput!)`: super-admin only.
- `updateProduct(id: String!, input: UpdateProductInput!)`: super-admin only.
- `deleteProduct(id: String!)`: super-admin only.
- `createReview(input: CreateReviewInput!)`: super-admin only.
- `updateReview(id: String!, input: UpdateReviewInput!)`: super-admin only.
- `deleteReview(id: String!)`: super-admin only.
- `createPreOrder(input: CreatePreOrderInput!)`: mirror of the pre-order REST flow.
- `completeOrder(id: String!)`: JWT protected; user must own the order or be super-admin.
- `rejectOrder(id: String!)`: same guard as `completeOrder`.
- `createSubscription(input: CreateSubscriptionInput!)`: start a billing subscription.
- `cancelSubscription(subscriptionId: String!)`: terminate an existing subscription.
- `addCartLineItem(input: AddCartLineItemInput!)`: create a line item either by `productId` snapshot or a full `product` payload with a fixed `priceUSD`.
- `removeCartLineItem(input: RemoveCartLineItemInput!)`: soft-delete a line item from the target cart.

Supporting inputs:

```graphql
input CartFilterInput {
  cartId: String
  ownerId: String
}

input ProductSnapshotInput {
  id: String!
  priceUSD: Float!
  metadata: JSON
}

input AddCartLineItemInput {
  cartId: String
  ownerId: String
  preOrderId: String
  productId: String
  product: ProductSnapshotInput
  priceUSD: Float
  productSelectionParams: JSON
  metadata: JSON
  externalUuid: String
}

input RemoveCartLineItemInput {
  cartId: String
  ownerId: String
  lineItemId: String!
}

input CreateReviewInput {
  productId: String!
  userId: String!
  review: String!
  orderId: String
  rate: Int!
  lang: String!
  date: DateTime
}

input UpdateReviewInput {
  productId: String
  userId: String
  review: String
  orderId: String
  rate: Int
  lang: String
  date: DateTime
}
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database setup

Use Prisma to apply migrations and seed baseline data (plans, bootstrap customer) before running the API locally or in CI:

```bash
$ npm run migrate:deploy
$ npm run db:seed
```

For automated environments run `npm run ci:db` to execute both steps.

### Switching data providers

Repositories can operate against Prisma or Supabase. By default the application uses Supabase; provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your `.env`. Set `DATA_PROVIDER=prisma` to fall back to the Prisma client and `DATABASE_URL`. All modules resolve their repositories from the chosen provider at runtime.

Environment variables are centralised in `src/config/config.ts` with Joi validation. Update that file if you introduce new configuration keys so they are typed and validated automatically.

### Stripe configuration

Provide the following environment variables to enable Stripe integrations:

| Variable                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `STRIPE_API_KEY`         | Secret key used for outbound Stripe requests |
| `STRIPE_WEBHOOK_SECRET`  | Signing secret for validating webhook calls  |

### Redis configuration

Pub/sub and GraphQL caching rely on Redis. Configure the connection with the following environment variables (defaults are shown):

| Variable      | Description                | Default     |
| ------------- | -------------------------- | ----------- |
| `REDIS_HOST`  | Redis server hostname      | `localhost` |
| `REDIS_PORT`  | Redis TCP port (numeric)   | `6379`      |

The values are validated on startup through `configValidationSchema`, so adjust that file when modifying the Redis setup.

### Supabase migrations

Supabase schema SQL lives in `supabase/migrations`. Apply them with the Supabase CLI:

```bash
# assuming SUPABASE_DB_URL points to your project database
$ supabase db reset --db-url "$SUPABASE_DB_URL" --file supabase/migrations/0001_init.sql
```

Or run the SQL in the Supabase dashboard. After bootstrap, keep Prisma and Supabase migrations in sync when evolving the schema.

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```
