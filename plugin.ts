import {
  GraphQLSchema, TypeInfo,
} from 'graphql';
import {
  schemaToTemplateContext,
  AstNode,
  Field,
  Type,
  Enum,
  SchemaTemplateContext,
} from 'graphql-codegen-core';

const graphqlScalarToMongooseScalar = {
  Int: 'Number',
  Float: 'Number',
  String: 'String',
  Boolean: 'Boolean',
  ID: 'Schema.Types.ObjectId',
};

const graphqlScalarToTsScalar = {
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
  ID: 'Types.ObjectId',
};


type Maybe<T> = T | void;

// Ignored field won't be added to the mongoose schema
type IgnoreDirective = {

}

// Should set { select: false } to final mongoose schema
type NoSelectDirective = {

}

type DefaultDirective = {
  // value: Maybe<string>; // TODO
  numberValue?: string;
  stringValue?: string;
}

type EntityDirective = {
  name?: string;
}

type ReferencesDirective = {
  entity: string;
  fieldName?: string;
}

export type Config = {
  // Mongoose schema names
  schemaNameTemplate: string;
  // Typescript type names
  tsInputNameTemplate: string;
  // Typescript type name of a interface that is extending mongoose.Document
  tsDocumentNameTemplate: string;
  // Typescript type name for enums
  tsEnumNameTemplate: string;
  // Model names
  modelNameTemplate: string;
}

export type IncomingConfig = {
  [K in keyof Config]?: Config[K];
}

export const defaultConfig: Config = {
  schemaNameTemplate: "{{name}}Schema",
  tsInputNameTemplate: "{{name}}Input",
  tsDocumentNameTemplate: "{{name}}",
  tsEnumNameTemplate: "{{name}}",
  modelNameTemplate: "{{name}}Model",
}

type Context = {
  templateContext: SchemaTemplateContext;
  config: Config;
}

const ENTITY_DIRECTIVE_KEY = 'entity';
const REFERENCES_DIRECTIVE_KEY = 'references';
const IGNORE_DIRECTIVE_KEY = 'ignore';
const DEFAULT_DIRECTIVE_KEY = 'default';
const NO_SELECT_DIRECTIVE_KEY = 'noSelect';

const idFieldName = '_id';
const skipFieldsInSchema = [idFieldName];

const skipTypes = ['Query', 'Mutation', 'Subscription'];

const defineMaybe = () => 'type Maybe<T> = T | void;';

const asArray = (type: string) => `Array<${type}>`;
const asMaybe = (type: string) => `Maybe<${type}>`;
const asString = (v: string) => `"${v}"`;

const createNameFromTemplate = (template: string, name: string) => template.replace("{{name}}", name);

const createTsEnumTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsEnumNameTemplate, typeName);

const createTsInputTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsInputNameTemplate, typeName);

const createTsDocumentTypeName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.tsDocumentNameTemplate, typeName);

const createSchemaName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.schemaNameTemplate, typeName);

const createModelName = (context: Context) => (typeName: string) =>
  createNameFromTemplate(context.config.modelNameTemplate, typeName);

const getDirective = <D>(key: string, node: AstNode): Maybe<D> =>
  node.directives[key] || null;

const hasDirective = (key: string, node: AstNode) =>
  Boolean(node.directives[key]);

const stringifyJsonWithoutEscaping = (o: object) => {
  const keys = Object
    .keys(o)
    .filter(k => o[k] !== undefined)
    .map(k => `${k}: ${o[k]}`).join(',');

  return `{${keys}}`;
}


const printTypeValue = (context: Context) => (field: Field) => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);
  const noSelectDirective = getDirective<NoSelectDirective>(NO_SELECT_DIRECTIVE_KEY, field);
  const defaultDirective = getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, field);


  let transformedType = field.type;

  if (field.isScalar) {
    transformedType = graphqlScalarToMongooseScalar[field.type] || transformedType;
  }

  if (field.isType) {
    transformedType = createSchemaName(context)(transformedType);
  }

  if (field.isEnum) {
    transformedType = graphqlScalarToMongooseScalar.String;
  }

  if (referencesDirective) {
    transformedType = graphqlScalarToMongooseScalar.ID;
  }

  type Result = {
    type: string;
    required: boolean | undefined;
    enum: string | undefined;
    default: string | undefined;
    select: boolean | undefined;
    ref: string | undefined;
  }

  let result: Result = {
    type: field.isArray ? `[${[transformedType]}]` : transformedType,
    required: field.isRequired ? true : undefined,
    default: undefined,
    enum: undefined,
    select: noSelectDirective ? false : undefined,
    ref: referencesDirective ? asString(referencesDirective.entity) : undefined,
  }

  if (field.isEnum) {
    const e = context.templateContext.enums.find(e => e.name === field.type);
    if (e) {
      result.enum = `[${e.values.map(v => asString(v.value)).join(', ')}]`;
      const valueWithDefaultDirective = e.values.find(v => {
        return Boolean(getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, v));
      });
      if (valueWithDefaultDirective) {
        result.default = asString(valueWithDefaultDirective.value);
      }
    }
  }

  if (defaultDirective) {
    if (defaultDirective.numberValue !== undefined) {
      result.default = defaultDirective.numberValue;
    }
    if (defaultDirective.stringValue !== undefined) {
      result.default = asString(defaultDirective.stringValue);
    }
  }

  // Let mongoose inject default value if it's available
  if (result.required && result.default) {
    result.required = undefined;
  }

  return stringifyJsonWithoutEscaping(result);
};

const printFieldName = (context: Context) => (field: Field) => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);

  if (referencesDirective && referencesDirective.fieldName) {
    return referencesDirective.fieldName;
  }

  return field.name;
}

type TsTypeInfo = {
  derivedType: string;
  isRequired: boolean;
  hasDefault: boolean;
  isArray: boolean;
  isNotSelectable: boolean;
  isReference: boolean;
}

const getTsTypeInfo = (context: Context) => (field: Field, createTypeName: (string) => string) => {
  const referencesDirective = getDirective<ReferencesDirective>(REFERENCES_DIRECTIVE_KEY, field);
  const noSelectDirective = getDirective<NoSelectDirective>(NO_SELECT_DIRECTIVE_KEY, field);
  const defaultDirective = getDirective<DefaultDirective>(DEFAULT_DIRECTIVE_KEY, field);

  let typeInfo: TsTypeInfo = {
    derivedType: field.type,
    isReference: Boolean(referencesDirective),
    isNotSelectable: Boolean(noSelectDirective),
    isArray: field.isArray,
    isRequired: field.isRequired,
    hasDefault: Boolean(defaultDirective),
  }

  if (field.isScalar) {
    typeInfo.derivedType = graphqlScalarToTsScalar[field.type] || typeInfo.derivedType;
  }

  if (field.isType) {
    typeInfo.derivedType = createTypeName(typeInfo.derivedType);
  }

  if (field.isEnum) {
    typeInfo.derivedType = createTsEnumTypeName(context)(typeInfo.derivedType);
  }

  if (referencesDirective) {
    typeInfo.derivedType = graphqlScalarToTsScalar.ID;
  }

  return typeInfo;
}

const printTsFieldValue = (context: Context) => (typeInfo: TsTypeInfo) => {
  let res = typeInfo.derivedType;

  if (typeInfo.isArray) {
    res = asArray(res);
  }

  if (!typeInfo.isRequired) {
    res = asMaybe(res);
  }

  return res;
}

const printTsField = (context: Context) => (field: Field, typeInfo: TsTypeInfo) =>
  `${printFieldName(context)(field)}: ${printTsFieldValue(context)(typeInfo)};`


const printTsType = (context: Context) => (type: Type) => {
  const entityDirective = getDirective<EntityDirective>(ENTITY_DIRECTIVE_KEY, type);
  const entityName = entityDirective && entityDirective.name ?
    entityDirective.name :
    type.name;

  const inputTypeName = createTsInputTypeName(context)(entityName);;
  const documentTypeName = createTsDocumentTypeName(context)(entityName);

  const filteredFields = type.fields.filter(field => !getDirective<IgnoreDirective>(IGNORE_DIRECTIVE_KEY, field))

  const inputFields = filteredFields
    .map(field => {
      let typeInfo = getTsTypeInfo(context)(field, createTsInputTypeName(context));

      if (field.name === idFieldName) {
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

  const documentFields = filteredFields
    .map(field => {
      let typeInfo = getTsTypeInfo(context)(field, createTsDocumentTypeName(context));

      if (field.name === idFieldName) {
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

const printType = (context: Context) => (type: Type) => {
  const schemaVariableName = createSchemaName(context)(type.name);

  const schemaDef = `const ${schemaVariableName} = new Schema({
    ${type.fields
      .filter(field => !skipFieldsInSchema.some(name => name === field.name))
      .filter(field => !getDirective<IgnoreDirective>(IGNORE_DIRECTIVE_KEY, field))
      .map(field => {
        return `  ${printFieldName(context)(field)}: ${printTypeValue(context)(field)}`;
      }).join(',\n')}
  });`;

  const entityDirective = getDirective<EntityDirective>(ENTITY_DIRECTIVE_KEY, type);
  let modelDef = '';
  if (entityDirective) {
    const entityName = entityDirective.name ? entityDirective.name : type.name;
    const modelName = createModelName(context)(entityName);
    modelDef = `
    export const ${modelName}: Model<${createTsDocumentTypeName(context)(entityName)}> =
      mongoose.model<${createTsDocumentTypeName(context)(entityName)}>('${entityName}', ${schemaVariableName});    
    `
  }

  const tsDef = printTsType(context)(type);

  return `
  ${schemaDef}

  ${tsDef}
  ${modelDef}
  `;
};

const printTsEnum = (context: Context) => (e: Enum) => {
  const typeName = createTsEnumTypeName(context)(e.name);

  return `export enum ${typeName} { ${e.values.map(v => `${v.value} = ${asString(v.value)}`).join(', ')} }`
}

module.exports = {
  plugin: (schema: GraphQLSchema, _: any, config: IncomingConfig) => {
    const templateContext = schemaToTemplateContext(schema);

    const context: Context = {
      templateContext,
      config: { ...defaultConfig, ...config }
    }


    const head = [
      `import mongoose, { Document, Schema, Model, Types } from 'mongoose';`,
    ].join('\n');
    const enums = templateContext.enums.map(e => {
      return `${printTsEnum(context)(e)}`;
    }).join('\n\n');
    const schemas = templateContext.types
      .filter(t => !skipTypes.some(n => n === t.name))
      .sort((a, b) => {
        // Put all entities to the end
        const aIsEntity = hasDirective(ENTITY_DIRECTIVE_KEY, a);
        const bIsEntity = hasDirective(ENTITY_DIRECTIVE_KEY, b);

        if (aIsEntity !== bIsEntity) return aIsEntity ? 1 : -1;

        // Sort alphabetically
        return a.name.localeCompare(b.name);
      })
      .map(type => {
        return printType(context)(type);
      }).join('\n\n');

    return `
      ${head}
      ${defineMaybe()}

      ${enums}
      ${schemas}
    `
  }
};