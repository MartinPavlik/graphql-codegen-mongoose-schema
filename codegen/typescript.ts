import { EnumTypeDefinitionNode, FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import {
  Context,
  createNameFromTemplate,
} from '../helpers';
import {
  getDirective,
  ENTITY_DIRECTIVE_KEY,
  REFERENCES_DIRECTIVE_KEY,
  IGNORE_DIRECTIVE_KEY,
  DEFAULT_DIRECTIVE_KEY,
  NO_SELECT_DIRECTIVE_KEY,
  IgnoreDirective,
  NoSelectDirective,
  DefaultDirective,
  EntityDirective,
  ReferencesDirective,
} from '../directives';
import { getFieldTypeInfo } from '../getFieldTypeInfo';


import { asString, asArray, asMaybe, printFieldName } from './common';

export const graphqlScalarToTsScalar = {
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
  ID: 'Types.ObjectId',
};

export const createTsEnumTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsEnumNameTemplate, typeName);

export const createTsInputTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsInputNameTemplate, typeName);

export const createTsDocumentTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsDocumentNameTemplate, typeName);

export const printTsEnum = (context: Context) => (node: EnumTypeDefinitionNode) => {
  const typeName = createTsEnumTypeName(context)(node.name.value);

  const values = node.values ? node.values.map(v => `${v.name.value} = ${asString(v.name.value)}`) : [];

  return [
    'export enum ', typeName, ' { \n',
    context.config.indentation,
    values.join(',\n' + context.config.indentation),
    '\n}'
  ].join('');
}

type TsTypeInfo = {
  derivedType: string;
  isRequired: boolean;
  hasDefault: boolean;
  isArray: boolean;
  isNotSelectable: boolean;
  isReference: boolean;
}

export const getTsTypeInfo = (context: Context) => (field: FieldDefinitionNode, createTypeName: (string) => string) => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);
  const noSelectDirective = getDirective<NoSelectDirective>(NO_SELECT_DIRECTIVE_KEY, field);
  const defaultDirective = getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, field);

  const fieldTypeInfo = getFieldTypeInfo(context)(field.type);

  let typeInfo: TsTypeInfo = {
    derivedType: fieldTypeInfo.type,
    isReference: Boolean(referencesDirective),
    isNotSelectable: Boolean(noSelectDirective),
    isArray: fieldTypeInfo.isArray,
    isRequired: fieldTypeInfo.isNonNull,
    hasDefault: Boolean(defaultDirective),
  }

  if (fieldTypeInfo.isScalar) {
    typeInfo.derivedType = graphqlScalarToTsScalar[fieldTypeInfo.type] || typeInfo.derivedType;
  }

  if (fieldTypeInfo.isType) {
    typeInfo.derivedType = createTypeName(fieldTypeInfo.type);
  }

  if (fieldTypeInfo.isEnum) {
    typeInfo.derivedType = createTsEnumTypeName(context)(fieldTypeInfo.type);
  }

  if (referencesDirective) {
    typeInfo.derivedType = graphqlScalarToTsScalar.ID;
  }

  return typeInfo;
}


export const printTsFieldValue = (context: Context) => (typeInfo: TsTypeInfo) => {
  let res = typeInfo.derivedType;

  if (typeInfo.isArray) {
    res = asArray(res);
  }

  if (!typeInfo.isRequired) {
    res = asMaybe(res);
  }

  return res;
}


export const printTsField = (context: Context) => (field: FieldDefinitionNode, typeInfo: TsTypeInfo) =>
  `${printFieldName(context)(field)}: ${printTsFieldValue(context)(typeInfo)};`


export const printTsType = (context: Context) => (node: ObjectTypeDefinitionNode) => {
  const entityDirective = getDirective<EntityDirective>(ENTITY_DIRECTIVE_KEY, node);
  const entityName = entityDirective && entityDirective.name ?
    entityDirective.name.value :
    node.name.value;

  const inputTypeName = createTsInputTypeName(context)(entityName);;
  const documentTypeName = createTsDocumentTypeName(context)(entityName);

  const filteredFields = (node.fields || []).filter(field => !getDirective<IgnoreDirective>(IGNORE_DIRECTIVE_KEY, field))

  const inputFields = filteredFields
    .map(field => {
      let typeInfo = getTsTypeInfo(context)(field, createTsInputTypeName(context));

      if (field.name.value === context.config.idFieldName) {
        typeInfo.derivedType = graphqlScalarToTsScalar.ID;
        typeInfo.isRequired = false;
      }

      if (
        // If there is default value, then the field is not required        
        typeInfo.hasDefault ||
        // Mongoose automatically uses empty array for arrays
        typeInfo.isArray
      ) {
        typeInfo.isRequired = false;
      }

      return printTsField(context)(field, typeInfo);
    }).join('\n');


  const referencedTypes = filteredFields.map(
    field => {

      const fieldTypeInfo = getFieldTypeInfo(context)(field.type);

      if (fieldTypeInfo.isType) {
        console.log('field is type: ', field.name.value, 'type:: :: ', fieldTypeInfo.type);
      }
    }
  )

  const documentFields = filteredFields
    .map(field => {
      let typeInfo = getTsTypeInfo(context)(field, createTsDocumentTypeName(context));

      if (field.name.value === context.config.idFieldName) {
        typeInfo.derivedType = graphqlScalarToTsScalar.ID;
        typeInfo.isRequired = true;
      }

      if (
        // If there is default value, then the field is not required        
        typeInfo.hasDefault ||
        // Mongoose automatically uses empty array for arrays
        typeInfo.isArray
      ) {
        typeInfo.isRequired = true;
      }

      if (typeInfo.isNotSelectable) {
        typeInfo.isRequired = false;
      }

      return printTsField(context)(field, typeInfo);
    }).join('\n');

  return `
  export interface ${inputTypeName} {
    ${inputFields}
  }

  export interface ${documentTypeName} ${entityDirective ? 'extends Document' : ''} {
    ${documentFields}
  }`

}
