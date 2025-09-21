import { Schema, model } from 'mongoose';

// Attributes Interface
interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// Skills Interface
interface Skills {
  acrobatics?: number;
  animalHandling?: number;
  arcana?: number;
  athletics?: number;
  deception?: number;
  history?: number;
  insight?: number;
  intimidation?: number;
  investigation?: number;
  medicine?: number;
  nature?: number;
  perception?: number;
  performance?: number;
  persuasion?: number;
  religion?: number;
  sleightOfHand?: number;
  stealth?: number;
  survival?: number;
  proficiencies?: string[];
  savingThrows?: string[];
}

// Combat Interface
interface Combat {
  armorClass: number;
  hitPoints: number;
  initiative: number;
  speed: number;
}

// Basic Info Interface
interface BasicInfo {
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  avatar: string;
  isCustomAvatar?: boolean;
}

// Spells Interface
export interface ISpell {
  name: string;
  level: number;
  prepared: boolean;
}

// Equipment Interface
interface Equipment {
  name: string;
  category: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc?: string[]; // Only using `desc` from GitHub
  properties?: string[];
}

// Currency Interface
interface Currency {
  copperPieces?: number;
  silverPieces?: number;
  electrumPieces?: number;
  goldPieces?: number;
  platinumPieces?: number;
}

// Feats Interface
interface Feat {
  name: string;
  desc: string[];
}

// Biography Interface
interface Biography {
  alignment: string;
  background: string;
  languages: string[];
}

// Character Document Interface
interface CharacterDocument {
  _id: string;
  player: Schema.Types.ObjectId;
  basicInfo?: BasicInfo;
  attributes?: Attributes;
  combat?: Combat;
  skills?: Skills;
  equipment?: Equipment[];
  spells?: ISpell[];
  weapons?: {
    name: string;
    desc: string;
    damage: string;
    damageType: string;
    range: string;
  }[];
  feats?: Feat[];
  inventory?: { name: string; desc: string }[];
  currency?: Currency;
  biography?: Biography;
  private: boolean; // New property
  classFeatures?: {
    name: string;
    description: string;
    levelRequired: number;
    selections?: FeatureSelection[];
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeatureSelection {
  featureName: string;
  selectedOption: string;
}

// Spell Schema
const spellSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 0, max: 20 },
    prepared: { type: Boolean, required: true, default: false },
    desc: [String],
    damage: Schema.Types.Mixed,
    range: String,
  },
  {
    _id: false, // Disable _id for subdocuments
    strict: true
  }
);

// Equipment Schema
const equipmentSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    cost: {
      quantity: { type: Number },
      unit: { type: String }
    },
    weight: { type: Number, default: 0 },
    description: { type: [String], default: [] },
    properties: { type: [String], default: [] }
  }
);

const featureSelectionSchema = new Schema({
  featureName: String,
  selectedOption: String
}, { _id: false });

const classFeatureSchema = new Schema({
  name: String,
  description: String,
  levelRequired: Number,
  selections: [featureSelectionSchema]
}, { _id: false });

// Character Schema
const characterSchema = new Schema<CharacterDocument>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    basicInfo: {
      name: { type: String, required: true },
      race: { type: String, required: true },
      class: { type: String, required: true },
      level: { type: Number, required: true, min: 1, max: 20 },
      background: { type: String },
      alignment: { type: String },
      avatar: { type: String, required: false },
      isCustomAvatar: { type: Boolean, default: false },
    },
    attributes: {
      strength: { type: Number, default: 10 },
      dexterity: { type: Number, default: 10 },
      constitution: { type: Number, default: 10 },
      intelligence: { type: Number, default: 10 },
      wisdom: { type: Number, default: 10 },
      charisma: { type: Number, default: 10 },
    },
    combat: {
      armorClass: { type: Number, default: 10 },
      hitPoints: { type: Number, default: 10 },
      initiative: { type: Number, default: 0 },
      speed: { type: Number, default: 30 },
    },
    skills: {
      acrobatics: Number,
      animalHandling: Number,
      arcana: Number,
      athletics: Number,
      deception: Number,
      history: Number,
      insight: Number,
      intimidation: Number,
      investigation: Number,
      medicine: Number,
      nature: Number,
      perception: Number,
      performance: Number,
      persuasion: Number,
      religion: Number,
      sleightOfHand: Number,
      stealth: Number,
      survival: Number,
      proficiencies: [String],
      savingThrows: [String],
    },
    equipment: [equipmentSchema],
    spells: {
      type: [spellSchema],
      default: [],
      required: true,
    },
    weapons: [
      {
        name: String,
        desc: String,
        damage: String,
        damageType: String,
        range: String,
      },
    ],
    feats: [
      {
        name: String,
        desc: [String],
      },
    ],
    inventory: [
      {
        name: String,
        desc: String,
      },
    ],
    biography: {
      alignment: String,
      background: String,
      languages: [String],
      backstory: { type: String, default: '' },
    },
    currency: {
      copperPieces: { type: Number, default: 0 },
      silverPieces: { type: Number, default: 0 },
      electrumPieces: { type: Number, default: 0 },
      goldPieces: { type: Number, default: 0 },
      platinumPieces: { type: Number, default: 0 },
    },
    private: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Add the classFeatures field
    classFeatures: [classFeatureSchema]
  },
  { timestamps: true }
);

const Character = model<CharacterDocument>('Character', characterSchema);

export default Character;
