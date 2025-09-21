type ClassFeature = {
    name: string;
    description: string;
    choices?: string[];
  };
  
  type ClassFeatures = {
    features: ClassFeature[];
    proficiencyChoices?: {
      name: string;
      options: string[];
      choose: number;
    }[];
  };
  
  const artificerFeatures: ClassFeatures = {
    features: [
      {
        name: "Magical Tinkering",
        description: "Imbue tiny objects with magical effects"
      },
      {
        name: "Spellcasting",
        description: "Cast artificer spells using Intelligence, prepare spells daily"
      }
    ],
    proficiencyChoices: [
      {
        name: "Tool Proficiencies",
        options: ["Thieves' tools", "Tinker's tools", "Alchemist's supplies", "Smith's tools", "Woodcarver's tools"],
        choose: 2
      }
    ]
  };
  
  const barbarianFeatures: ClassFeatures = {
    features: [
      {
        name: "Rage",
        description: "Enter a battle fury gaining combat benefits and damage resistance"
      },
      {
        name: "Unarmored Defense",
        description: "AC equals 10 + Dexterity modifier + Constitution modifier when not wearing armor"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
        choose: 2
      }
    ]
  };
  
  const bardFeatures: ClassFeatures = {
    features: [
      {
        name: "Spellcasting",
        description: "Cast bard spells using Charisma"
      },
      {
        name: "Bardic Inspiration",
        description: "Grant inspiration die (d6) to boost ability checks, attack rolls, or saving throws"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
        choose: 3
      }
    ]
  };
  
  const clericFeatures: ClassFeatures = {
    features: [
      {
        name: "Spellcasting",
        description: "Cast cleric spells using Wisdom"
      },
      {
        name: "Divine Domain",
        description: "Choose a domain that grants additional spells and features",
        choices: [
          "Knowledge Domain",
          "Life Domain",
          "Light Domain",
          "Nature Domain",
          "Tempest Domain",
          "Trickery Domain",
          "War Domain",
          "Death Domain",
          "Forge Domain",
          "Grave Domain",
          "Order Domain",
          "Peace Domain",
          "Twilight Domain"
        ]
      }
    ]
  };
  
  const druidFeatures: ClassFeatures = {
    features: [
      {
        name: "Druidic",
        description: "Know Druidic language and can leave hidden messages"
      },
      {
        name: "Spellcasting",
        description: "Cast druid spells using Wisdom"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
        choose: 2
      }
    ]
  };
  
  const fighterFeatures: ClassFeatures = {
    features: [
      {
        name: "Fighting Style",
        description: "Adopt a specialized style of fighting",
        choices: [
          "Archery: +2 bonus to ranged weapon attack rolls",
          "Defense: +1 bonus to AC when wearing armor",
          "Dueling: +2 bonus to damage rolls with one-handed weapons",
          "Great Weapon Fighting: Reroll 1s and 2s on damage dice with two-handed weapons",
          "Protection: Impose disadvantage on attack rolls against adjacent allies",
          "Two-Weapon Fighting: Add ability modifier to off-hand damage",
          "Blind Fighting: Gain blindsight within 10 feet",
          "Interception: Reduce damage to nearby allies",
          "Superior Technique: Learn one maneuver",
          "Thrown Weapon Fighting: Bonus to thrown weapon damage",
          "Unarmed Fighting: Improved unarmed strikes"
        ]
      },
      {
        name: "Second Wind",
        description: "Regain hit points as a bonus action"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
        choose: 2
      }
    ]
  };
  
  const monkFeatures: ClassFeatures = {
    features: [
      {
        name: "Unarmored Defense",
        description: "AC equals 10 + Dexterity modifier + Wisdom modifier when not wearing armor"
      },
      {
        name: "Martial Arts",
        description: "Use Dexterity for unarmed strikes and monk weapons, bonus action unarmed strike"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
        choose: 2
      }
    ]
  };
  
  const paladinFeatures: ClassFeatures = {
    features: [
      {
        name: "Divine Sense",
        description: "Detect celestials, fiends, and undead"
      },
      {
        name: "Lay on Hands",
        description: "Pool of healing power that restores hit points"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
        choose: 2
      }
    ]
  };
  
  const rangerFeatures: ClassFeatures = {
    features: [
      {
        name: "Favored Enemy",
        description: "Advantage on tracking and recalling information about specific creature types",
        choices: [
          "Aberrations",
          "Beasts",
          "Celestials",
          "Constructs",
          "Dragons",
          "Elementals",
          "Fey",
          "Fiends",
          "Giants",
          "Monstrosities",
          "Oozes",
          "Plants",
          "Undead",
          "Two humanoid races"
        ]
      },
      {
        name: "Natural Explorer",
        description: "Expertise in navigating and surviving in specific terrain types",
        choices: [
          "Arctic",
          "Coast",
          "Desert",
          "Forest",
          "Grassland",
          "Mountain",
          "Swamp",
          "Underdark"
        ]
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
        choose: 3
      }
    ]
  };
  
  const rogueFeatures: ClassFeatures = {
    features: [
      {
        name: "Expertise",
        description: "Double proficiency bonus for two skill proficiencies"
      },
      {
        name: "Sneak Attack",
        description: "Extra damage when hitting with advantage or when ally is nearby"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
        choose: 4
      }
    ]
  };
  
  const sorcererFeatures: ClassFeatures = {
    features: [
      {
        name: "Spellcasting",
        description: "Cast sorcerer spells using Charisma"
      },
      {
        name: "Sorcerous Origin",
        description: "Choose source of powers that grants additional features",
        choices: [
          "Aberrant Mind",
          "Clockwork Soul",
          "Divine Soul",
          "Draconic Bloodline",
          "Shadow Magic",
          "Storm Sorcery",
          "Wild Magic"
        ]
      }
    ]
  };
  
  const warlockFeatures: ClassFeatures = {
    features: [
      {
        name: "Otherworldly Patron",
        description: "Form pact with powerful entity that grants features",
        choices: [
          "Archfey",
          "Celestial",
          "Fathomless",
          "Fiend",
          "Genie",
          "Great Old One",
          "Hexblade",
          "Undead",
          "Undying"
        ]
      },
      {
        name: "Pact Magic",
        description: "Cast warlock spells using Charisma, regain slots on short rest"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
        choose: 2
      }
    ]
  };
  
  const wizardFeatures: ClassFeatures = {
    features: [
      {
        name: "Spellcasting",
        description: "Cast wizard spells using Intelligence"
      },
      {
        name: "Arcane Recovery",
        description: "Recover spell slots during short rest"
      }
    ],
    proficiencyChoices: [
      {
        name: "Skill Proficiencies",
        options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
        choose: 2
      }
    ]
  };
  
  const allClassFeatures = {
    artificer: artificerFeatures,
    barbarian: barbarianFeatures,
    bard: bardFeatures,
    cleric: clericFeatures,
    druid: druidFeatures,
    fighter: fighterFeatures,
    monk: monkFeatures,
    paladin: paladinFeatures,
    ranger: rangerFeatures,
    rogue: rogueFeatures,
    sorcerer: sorcererFeatures,
    warlock: warlockFeatures,
    wizard: wizardFeatures
  };
  
  export default allClassFeatures;