import { FieldDefinitionNode } from 'graphql'; 
import { Context } from '../helpers';
import {
  getDirective,
  REFERENCES_DIRECTIVE_KEY,
  ReferencesDirective
} from '../directives';

export const stringifyJsonWithoutEscaping = (o: object) => {
  const keys = Object
    .keys(o)
    .filter(k => o[k] !== undefined)
    .map(k => `${k}: ${o[k]}`).join(',');

  return `{${keys}}`;
}

export const defineMaybe = () => 'type Maybe<T> = T | void;';
export const asArray = (type: string) => `Array<${type}>`;
export const asMaybe = (type: string) => `Maybe<${type}>`;
export const asString = (v: string) => `"${v}"`;

export const printFieldName = (context: Context) => (field: FieldDefinitionNode): string => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);

  if (referencesDirective && referencesDirective.fieldName && referencesDirective.fieldName.value) {
    return referencesDirective.fieldName.value;
  }

  return field.name.value;
}