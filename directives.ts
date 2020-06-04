import {
  ObjectTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  ArgumentNode,
} from 'graphql';
import { Maybe } from './helpers';

export const ENTITY_DIRECTIVE_KEY = 'entity';
export const REFERENCES_DIRECTIVE_KEY = 'references';
export const IGNORE_DIRECTIVE_KEY = 'ignore';
export const DEFAULT_DIRECTIVE_KEY = 'default';
export const NO_SELECT_DIRECTIVE_KEY = 'noSelect';

export const DIRECTIVES = `
  directive @${REFERENCES_DIRECTIVE_KEY}(
    entity: String!,
    fieldName: String
  ) on FIELD_DEFINITION

  directive @${ENTITY_DIRECTIVE_KEY}(
    name: String
  ) on OBJECT

  directive @${IGNORE_DIRECTIVE_KEY} on FIELD_DEFINITION
  
  directive @${DEFAULT_DIRECTIVE_KEY}(
    numberValue: Float,
    stringValue: String
  ) on ENUM_VALUE | FIELD_DEFINITION

  directive @${NO_SELECT_DIRECTIVE_KEY} on FIELD_DEFINITION
`;

type DirectiveValue = {
  kind: 'StringValue' | 'FloatValue' | 'IntValue' | 'BooleanValue' | 'NullValue',
  value: any,
}

type StringDirectiveValue = {
  kind: 'StringValue',
  value: string;
}

// Ignored field won't be added to the mongoose schema
export type IgnoreDirective = {

}

// Should set { select: false } to final mongoose schema
export type NoSelectDirective = {

}

export type DefaultDirective = {
  // value: Maybe<string>; // TODO
  numberValue?: StringDirectiveValue;
  stringValue?: StringDirectiveValue;
}

export type EntityDirective = {
  name?: StringDirectiveValue
}

export type ReferencesDirective = {
  entity: StringDirectiveValue;
  fieldName?: StringDirectiveValue;
}


// TODO - mess
const simplifyArgument = (argument: ArgumentNode) => {
  const argumentName = argument.name.value;

  const simpleValueKinds = ['StringValue', 'FloatValue', 'IntValue', 'BooleanValue', 'NullValue'];

  console.log('simplify argument: ', argument);

  if (simpleValueKinds.indexOf(argument.value.kind) > -1) {
    console.log('simplify argument: simple argument ', argumentName);

    return {
      [argumentName]: argument.value,
    }
  }

  return {};
}

const simplifyArguments = (args: readonly ArgumentNode[]) =>
  args.reduce(
    (res, a) => ({ ...res, ...simplifyArgument(a) }),
    {},
  )

export const getDirective = <D>(key: string, node: ObjectTypeDefinitionNode | FieldDefinitionNode | EnumValueDefinitionNode): Maybe<D> => {
  const directive = (node.directives || []).find(d => d.name.value === key);

  if (directive && directive.arguments) {
    // TODO - simplifyArguments does not return D !!!!!!!!!
    const res = simplifyArguments(directive.arguments) as Maybe<D>
    return res;
  }

  return undefined;
}