import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class GraphqlResolver {
  @Query(() => String, { name: 'graphqlHealth' })
  graphqlHealth(): string {
    return 'ok';
  }
}
