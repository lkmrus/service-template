import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

@Scalar('JSON')
export class JSONScalar implements CustomScalar<JSONValue, JSONValue> {
  description = 'Arbitrary JSON value';

  serialize(value: JSONValue): JSONValue {
    return value;
  }

  parseValue(value: JSONValue): JSONValue {
    return value;
  }

  parseLiteral(ast: ValueNode): JSONValue {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value as JSONValue;
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value);
      case Kind.OBJECT: {
        const result: Record<string, JSONValue> = {};
        ast.fields.forEach((field) => {
          result[field.name.value] = this.parseLiteral(field.value);
        });
        return result;
      }
      case Kind.LIST:
        return ast.values.map((valueNode) => this.parseLiteral(valueNode));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }
}
