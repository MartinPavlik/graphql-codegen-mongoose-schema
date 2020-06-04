import mongoose, { Document, Schema, Model, Types } from 'mongoose';
type Maybe<T> = T | void;
const CardDataFaceSchema = new Schema({
      artist: {type: String},
  colorIndicator: {type: [String],required: true},
  colors: {type: [String],required: true},
  flavorText: {type: String},
  illustrationId: {type: String},
  imageUris: {type: CardDataImageUrisSchema},
  loyalty: {type: String},
  manaCost: {type: String,default: ""},
  name: {type: String,required: true},
  oracleText: {type: String},
  power: {type: String},
  printedName: {type: String},
  printedText: {type: String},
  printedTypeLine: {type: String},
  toughness: {type: String},
  typeLine: {type: String},
  watermark: {type: String}
  });


  export interface CardDataFaceInput {
    artist: Maybe<string>;
colorIndicator: Maybe<Array<string>>;
colors: Maybe<Array<string>>;
flavorText: Maybe<string>;
illustrationId: Maybe<string>;
imageUris: Maybe<CardDataImageUrisInput>;
loyalty: Maybe<string>;
manaCost: Maybe<string>;
name: string;
oracleText: Maybe<string>;
power: Maybe<string>;
printedName: Maybe<string>;
printedText: Maybe<string>;
printedTypeLine: Maybe<string>;
toughness: Maybe<string>;
typeLine: Maybe<string>;
watermark: Maybe<string>;
  }

  export interface CardDataFace  {
    artist: Maybe<string>;
colorIndicator: Array<string>;
colors: Array<string>;
flavorText: Maybe<string>;
illustrationId: Maybe<string>;
imageUris: Maybe<CardDataImageUris>;
loyalty: Maybe<string>;
manaCost: string;
name: string;
oracleText: Maybe<string>;
power: Maybe<string>;
printedName: Maybe<string>;
printedText: Maybe<string>;
printedTypeLine: Maybe<string>;
toughness: Maybe<string>;
typeLine: Maybe<string>;
watermark: Maybe<string>;
  }
const CardDataImageUrisSchema = new Schema({
      small: {type: String},
  normal: {type: String},
  large: {type: String},
  png: {type: String},
  artCrop: {type: String},
  borderCrop: {type: String}
  });


  export interface CardDataImageUrisInput {
    small: Maybe<string>;
normal: Maybe<string>;
large: Maybe<string>;
png: Maybe<string>;
artCrop: Maybe<string>;
borderCrop: Maybe<string>;
  }

  export interface CardDataImageUris  {
    small: Maybe<string>;
normal: Maybe<string>;
large: Maybe<string>;
png: Maybe<string>;
artCrop: Maybe<string>;
borderCrop: Maybe<string>;
  }
const CardDataLegalitiesSchema = new Schema({
      standard: {type: String},
  future: {type: String},
  frontier: {type: String},
  modern: {type: String},
  legacy: {type: String},
  pauper: {type: String},
  vintage: {type: String},
  penny: {type: String},
  commander: {type: String},
  duel: {type: String},
  brawl: {type: String}
  });


  export interface CardDataLegalitiesInput {
    standard: Maybe<string>;
future: Maybe<string>;
frontier: Maybe<string>;
modern: Maybe<string>;
legacy: Maybe<string>;
pauper: Maybe<string>;
vintage: Maybe<string>;
penny: Maybe<string>;
commander: Maybe<string>;
duel: Maybe<string>;
brawl: Maybe<string>;
  }

  export interface CardDataLegalities  {
    standard: Maybe<string>;
future: Maybe<string>;
frontier: Maybe<string>;
modern: Maybe<string>;
legacy: Maybe<string>;
pauper: Maybe<string>;
vintage: Maybe<string>;
penny: Maybe<string>;
commander: Maybe<string>;
duel: Maybe<string>;
brawl: Maybe<string>;
  }
const CardDataSchema = new Schema({
      cardTypes: {type: [String],required: true},
  subTypes: {type: [String],required: true},
  superType: {type: String},
  scryfallId: {type: String},
  lang: {type: String,required: true},
  mtgoId: {type: Number},
  mtgoFoilId: {type: Number},
  multiverseIds: {type: [Number]},
  tcgplayerId: {type: Number},
  oracleId: {type: String,required: true},
  printsSearchUri: {type: String,required: true},
  rulingsUri: {type: String,required: true},
  scryfallUri: {type: String,required: true},
  uri: {type: String,required: true},
  cardFaces: {type: [CardDataFaceSchema],required: true},
  cmc: {type: Number,required: true},
  colors: {type: [String],required: true},
  colorIdentity: {type: [String],required: true},
  colorIndicator: {type: [String],required: true},
  edhrecRank: {type: Number},
  foil: {type: Boolean,required: true},
  handModifier: {type: String},
  layout: {type: String,required: true},
  legalities: {type: CardDataLegalitiesSchema,required: true},
  lifeModifier: {type: String},
  loyalty: {type: String},
  manaCost: {type: String,default: ""},
  name: {type: String,required: true},
  nonfoil: {type: Boolean,required: true},
  oracleText: {type: String},
  oversized: {type: Boolean,required: true},
  power: {type: String},
  reserved: {type: Boolean,required: true},
  toughness: {type: String},
  typeLine: {type: String,required: true},
  artist: {type: String},
  borderColor: {type: String,required: true},
  collectorNumber: {type: String,required: true},
  digital: {type: Boolean,required: true},
  flavorText: {type: String},
  frameEffect: {type: String},
  frame: {type: String,required: true},
  fullArt: {type: Boolean,required: true},
  games: {type: [String],required: true},
  highresImage: {type: Boolean,required: true},
  illustrationId: {type: String},
  imageUris: {type: CardDataImageUrisSchema},
  promo: {type: Boolean,required: true},
  rarity: {type: String,required: true},
  releasedAt: {type: String,required: true},
  reprint: {type: Boolean,required: true},
  scryfallSetUri: {type: String,required: true},
  setName: {type: String,required: true},
  setSearchUri: {type: String,required: true},
  setUri: {type: String,required: true},
  set: {type: String,required: true},
  storySpotlight: {type: String,required: true},
  watermark: {type: String}
  });

          export const CardDataModel: Model<CardData> =
            mongoose.model<CardData>('CardData', CardDataSchema);    
          

  export interface CardDataInput {
    _id: Maybe<Types.ObjectId>;
cardTypes: Maybe<Array<string>>;
subTypes: Maybe<Array<string>>;
superType: Maybe<string>;
scryfallId: Maybe<string>;
lang: string;
mtgoId: Maybe<number>;
mtgoFoilId: Maybe<number>;
multiverseIds: Maybe<Array<number>>;
tcgplayerId: Maybe<number>;
oracleId: string;
printsSearchUri: string;
rulingsUri: string;
scryfallUri: string;
uri: string;
cardFaces: Maybe<Array<CardDataFaceInput>>;
cmc: number;
colors: Maybe<Array<string>>;
colorIdentity: Maybe<Array<string>>;
colorIndicator: Maybe<Array<string>>;
edhrecRank: Maybe<number>;
foil: boolean;
handModifier: Maybe<string>;
layout: string;
legalities: CardDataLegalitiesInput;
lifeModifier: Maybe<string>;
loyalty: Maybe<string>;
manaCost: Maybe<string>;
name: string;
nonfoil: boolean;
oracleText: Maybe<string>;
oversized: boolean;
power: Maybe<string>;
reserved: boolean;
toughness: Maybe<string>;
typeLine: string;
artist: Maybe<string>;
borderColor: string;
collectorNumber: string;
digital: boolean;
flavorText: Maybe<string>;
frameEffect: Maybe<string>;
frame: string;
fullArt: boolean;
games: Maybe<Array<string>>;
highresImage: boolean;
illustrationId: Maybe<string>;
imageUris: Maybe<CardDataImageUrisInput>;
promo: boolean;
rarity: string;
releasedAt: string;
reprint: boolean;
scryfallSetUri: string;
setName: string;
setSearchUri: string;
setUri: string;
set: string;
storySpotlight: string;
watermark: Maybe<string>;
  }

  export interface CardData extends Document {
    _id: Types.ObjectId;
cardTypes: Array<string>;
subTypes: Array<string>;
superType: Maybe<string>;
scryfallId: Maybe<string>;
lang: string;
mtgoId: Maybe<number>;
mtgoFoilId: Maybe<number>;
multiverseIds: Array<number>;
tcgplayerId: Maybe<number>;
oracleId: string;
printsSearchUri: string;
rulingsUri: string;
scryfallUri: string;
uri: string;
cardFaces: Array<CardDataFace>;
cmc: number;
colors: Array<string>;
colorIdentity: Array<string>;
colorIndicator: Array<string>;
edhrecRank: Maybe<number>;
foil: boolean;
handModifier: Maybe<string>;
layout: string;
legalities: CardDataLegalities;
lifeModifier: Maybe<string>;
loyalty: Maybe<string>;
manaCost: string;
name: string;
nonfoil: boolean;
oracleText: Maybe<string>;
oversized: boolean;
power: Maybe<string>;
reserved: boolean;
toughness: Maybe<string>;
typeLine: string;
artist: Maybe<string>;
borderColor: string;
collectorNumber: string;
digital: boolean;
flavorText: Maybe<string>;
frameEffect: Maybe<string>;
frame: string;
fullArt: boolean;
games: Array<string>;
highresImage: boolean;
illustrationId: Maybe<string>;
imageUris: Maybe<CardDataImageUris>;
promo: boolean;
rarity: string;
releasedAt: string;
reprint: boolean;
scryfallSetUri: string;
setName: string;
setSearchUri: string;
setUri: string;
set: string;
storySpotlight: string;
watermark: Maybe<string>;
  }
const UserSchema = new Schema({
      username: {type: String,required: true},
  password: {type: String,required: true,select: false}
  });

          export const UserModel: Model<User> =
            mongoose.model<User>('User', UserSchema);    
          

  export interface UserInput {
    _id: Maybe<Types.ObjectId>;
username: string;
password: string;
  }

  export interface User extends Document {
    _id: Types.ObjectId;
username: string;
password: Maybe<string>;
  }
export enum DeckSharingPolicy { 
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED",
  PUBLIC = "PUBLIC"
}
const ImportDeckLineSchema = new Schema({
      error: {type: String},
  cardData: {type: CardDataSchema},
  line: {type: String,required: true},
  set: {type: String},
  count: {type: Number}
  });


  export interface ImportDeckLineInput {
    error: Maybe<string>;
cardData: Maybe<CardDataInput>;
line: string;
set: Maybe<string>;
count: Maybe<number>;
  }

  export interface ImportDeckLine  {
    error: Maybe<string>;
cardData: Maybe<CardData>;
line: string;
set: Maybe<string>;
count: Maybe<number>;
  }
const CardEdgeSchema = new Schema({
      cardDataId: {type: Schema.Types.ObjectId,required: true,ref: "CardData"},
  board: {type: String,required: true},
  categories: {type: [String],required: true},
  count: {type: Number,default: 1}
  });


  export interface CardEdgeInput {
    cardDataId: Types.ObjectId;
board: string;
categories: Maybe<Array<string>>;
count: Maybe<number>;
  }

  export interface CardEdge  {
    cardDataId: Types.ObjectId;
board: string;
categories: Array<string>;
count: number;
  }
const DeckSchema = new Schema({
      title: {type: String,required: true},
  description: {type: String},
  avatarUrl: {type: String,default: ""},
  sharingPolicy: {type: String,default: "PRIVATE",enum: ["PRIVATE", "UNLISTED", "PUBLIC"]},
  categories: {type: [String],required: true},
  cards: {type: [CardEdgeSchema],required: true},
  ownerId: {type: Schema.Types.ObjectId,required: true,ref: "User"},
  colors: {type: [String],required: true}
  });

          export const DeckModel: Model<Deck> =
            mongoose.model<Deck>('Deck', DeckSchema);    
          

  export interface DeckInput {
    _id: Maybe<Types.ObjectId>;
title: string;
description: Maybe<string>;
avatarUrl: Maybe<string>;
sharingPolicy: DeckSharingPolicy;
categories: Maybe<Array<string>>;
cards: Maybe<Array<CardEdgeInput>>;
ownerId: Types.ObjectId;
colors: Maybe<Array<string>>;
  }

  export interface Deck extends Document {
    _id: Types.ObjectId;
title: string;
description: Maybe<string>;
avatarUrl: string;
sharingPolicy: DeckSharingPolicy;
categories: Array<string>;
cards: Array<CardEdge>;
ownerId: Types.ObjectId;
colors: Array<string>;
  }