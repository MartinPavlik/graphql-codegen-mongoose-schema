import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode
} from 'graphql';
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
import {
  stringifyJsonWithoutEscaping,
  asString,
  asArray,
  asMaybe,
  printFieldName,
} from './common';


export const createSchemaName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.schemaNameTemplate, typeName);

export const createModelName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.modelNameTemplate, typeName);

export const graphqlScalarToMongooseScalar = {
  Int: 'Number',
  Float: 'Number',
  String: 'String',
  Boolean: 'Boolean',
  ID: 'Schema.Types.ObjectId',
};

const printTypeValue = (context: Context) => (field: FieldDefinitionNode) => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);
  const noSelectDirective = getDirective<NoSelectDirective>(NO_SELECT_DIRECTIVE_KEY, field);
  const defaultDirective = getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, field);


  const fieldTypeInfo = getFieldTypeInfo(context)(field.type);

  let transformedType = fieldTypeInfo.type;

  if (fieldTypeInfo.isScalar) {
    transformedType = graphqlScalarToMongooseScalar[fieldTypeInfo.type] || transformedType;
  }

  if (fieldTypeInfo.isType) {
    transformedType = createSchemaName(context)(fieldTypeInfo.type);
  }

  // TODO - this is kinda bullshit
  if (fieldTypeInfo.isEnum) {
    transformedType = graphqlScalarToMongooseScalar.String;
  }

  if (referencesDirective) {
    transformedType = graphqlScalarToMongooseScalar.ID;
  }

  type MongooseField = {
    type: string;
    required: boolean | undefined;
    enum: string | undefined;
    default: string | undefined;
    select: boolean | undefined;
    ref: string | undefined;
  }

  let result: MongooseField = {
    type: fieldTypeInfo.isArray ? `[${[transformedType]}]` : transformedType,
    required: fieldTypeInfo.isNonNull ? true : undefined,
    default: undefined,
    enum: undefined,
    select: noSelectDirective ? false : undefined,
    ref: referencesDirective ? asString(referencesDirective.entity.value) : undefined,
  }

  // TODO - enums can have also different type than just a string...
  if (fieldTypeInfo.referencedEnumDefinition && fieldTypeInfo.referencedEnumDefinition.values) {
    result.enum = `[${fieldTypeInfo.referencedEnumDefinition.values.map(v => asString(v.name.value)).join(', ')}]`;
    const valueWithDefaultDirective = fieldTypeInfo.referencedEnumDefinition.values.find(v => {
      return Boolean(getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, v));
    });
    if (valueWithDefaultDirective) {
      result.default = asString(valueWithDefaultDirective.name.value);
    }
  }

  if (defaultDirective) {
    if (defaultDirective.numberValue !== undefined) {
      result.default = defaultDirective.numberValue.value;
    }
    if (defaultDirective.stringValue !== undefined) {
      result.default = asString(defaultDirective.stringValue.value);
    }
  }

  // Let mongoose inject default value if it's available
  if (result.required && result.default) {
    result.required = undefined;
  }

  return stringifyJsonWithoutEscaping(result);
};

export const createMongooseSchemaDefinition = (context: Context) => (node: ObjectTypeDefinitionNode) => {
  const schemaVariableName = createSchemaName(context)(node.name.value);


  const fields = (node.fields || [])
    .filter(field => !context.config.mongooseSkipFieldsInSchema.some(name => name === field.name.value))
    .filter(field => !getDirective<IgnoreDirective>(IGNORE_DIRECTIVE_KEY, field))
    .map(field => {
      const fieldName = printFieldName(context)(field);
      const fieldType = printTypeValue(context)(field)
      return `  ${fieldName}: ${fieldType}`;
    }).join(',\n')

  const schemaDef = `const ${schemaVariableName} = new Schema({
    ${fields}
  });`;

  return schemaDef;
}