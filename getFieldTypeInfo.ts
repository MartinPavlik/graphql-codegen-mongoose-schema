
import {
  EnumTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';

import { Maybe, Context, GRAPHQL_SCALARS } from './helpers';

export type FieldTypeInfo = {
  isArray: boolean;
  isNonNull: boolean;
  isScalar: boolean;
  type: any;
  isEnum: boolean;
  referencedEnumDefinition: Maybe<EnumTypeDefinitionNode>,
  isType: boolean;
  referencedTypeDefinition: Maybe<ObjectTypeDefinitionNode>,
}

const initialFieldTypeInfo: FieldTypeInfo = {
  isArray: false,
  isNonNull: false,
  isScalar: false,
  type: undefined,
  isEnum: false,
  referencedEnumDefinition: undefined,
  isType: false,
  referencedTypeDefinition: undefined,
}

export const getFieldTypeInfo = (context: Context) => (type: TypeNode): FieldTypeInfo => {
  if (type.kind === "NonNullType") {
    return {
      ...initialFieldTypeInfo,
      ...getFieldTypeInfo(context)(type.type),
      isNonNull: true,
    }
  }
  if (type.kind === "ListType") {
    return {
      ...initialFieldTypeInfo,
      ...getFieldTypeInfo(context)(type.type),
      isArray: true,
    }
  }

  // Force cast to Maybe<EnumTypeDefinitionNode> since I don't know how to make it in a nicer way
  const referencedEnumDefinition = <Maybe<EnumTypeDefinitionNode>>context.astRoot.definitions.find(
    d => d.kind === 'EnumTypeDefinition' && d.name.value === type.name.value,
  );
  const isEnum = Boolean(referencedEnumDefinition);

  const referencedTypeDefinition = <Maybe<ObjectTypeDefinitionNode>>context.astRoot.definitions.find(
    d => d.kind === 'ObjectTypeDefinition' && d.name.value === type.name.value,
  );
  const isType = Boolean(referencedTypeDefinition);


  const customScalarTypeDefinitionNames = (<ObjectTypeDefinitionNode[]>context.astRoot.definitions.filter(
    d => d.kind === 'ScalarTypeDefinition'
  )).map(d => d.name.value);

  return {
    ...initialFieldTypeInfo,
    isScalar: [...customScalarTypeDefinitionNames, ...GRAPHQL_SCALARS].indexOf(type.name.value) > -1,
    isEnum,
    referencedEnumDefinition,
    isType,
    referencedTypeDefinition,
    type: type.name.value
  }
}