export interface BackgroundFeature {
    name: string;
    description: string;
  }
  
  export interface Background {
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies?: string[];
    languages?: number;
    equipment: string[];
    feature: BackgroundFeature;
  }
  
  export const backgrounds: Background[] = [
    {
      name: "Acolyte",
      description: "You have spent your life in service to a temple, learning sacred rites and providing sacrifices to the gods.",
      skillProficiencies: ["Insight", "Religion"],
      languages: 2,
      equipment: [
        "A holy symbol",
        "Prayer book or prayer wheel",
        "5 sticks of incense",
        "Vestments",
        "Set of common clothes",
        "Belt pouch with 15 gp"
      ],
      feature: {
        name: "Shelter of the Faithful",
        description: "As an acolyte, you command the respect of those who share your faith. You can perform religious ceremonies. You and your companions can receive free healing and care at temples, shrines, and other establishments of your faith."
      }
    },
    {
      name: "Charlatan",
      description: "You have always had a way with people. You know what makes them tick, and can tease out their heart's desires after a few minutes of conversation.",
      skillProficiencies: ["Deception", "Sleight of Hand"],
      toolProficiencies: ["Disguise kit", "Forgery kit"],
      equipment: [
        "Fine clothes",
        "Disguise kit",
        "Tools of the con of your choice",
        "Belt pouch with 15 gp"
      ],
      feature: {
        name: "False Identity",
        description: "You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona."
      }
    },
    {
      name: "Criminal",
      description: "You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld.",
      skillProficiencies: ["Deception", "Stealth"],
      toolProficiencies: ["One type of gaming set", "Thieves' tools"],
      equipment: [
        "Crowbar",
        "Dark common clothes with hood",
        "Belt pouch with 15 gp"
      ],
      feature: {
        name: "Criminal Contact",
        description: "You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals."
      }
    },
    {
      name: "Entertainer",
      description: "You thrive in front of an audience. You know how to entrance them, entertain them, and even inspire them.",
      skillProficiencies: ["Acrobatics", "Performance"],
      toolProficiencies: ["Disguise kit", "One type of musical instrument"],
      equipment: [
        "Musical instrument (one of your choice)",
        "The favor of an admirer",
        "Costume",
        "Belt pouch with 15 gp"
      ],
      feature: {
        name: "By Popular Demand",
        description: "You can always find a place to perform. You receive free lodging and food of a modest or comfortable standard as long as you perform each night."
      }
    },
    {
      name: "Folk Hero",
      description: "You come from a humble social rank, but you are destined for so much more. The people of your home village regard you as their champion.",
      skillProficiencies: ["Animal Handling", "Survival"],
      toolProficiencies: ["One type of artisan's tools", "Vehicles (land)"],
      equipment: [
        "Set of artisan's tools",
        "Shovel",
        "Iron pot",
        "Common clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "Rustic Hospitality",
        description: "Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners."
      }
    },
    {
      name: "Guild Artisan",
      description: "You are a member of an artisan's guild, skilled in a particular field and closely associated with other artisans.",
      skillProficiencies: ["Insight", "Persuasion"],
      toolProficiencies: ["One type of artisan's tools"],
      languages: 1,
      equipment: [
        "Set of artisan's tools",
        "Letter of introduction from your guild",
        "Traveler's clothes",
        "Belt pouch with 15 gp"
      ],
      feature: {
        name: "Guild Membership",
        description: "As an established member of a guild, you can rely on certain benefits that membership provides."
      }
    },
    {
      name: "Hermit",
      description: "You lived in seclusion for a formative part of your life, either in a sheltered community or entirely alone.",
      skillProficiencies: ["Medicine", "Religion"],
      toolProficiencies: ["Herbalism kit"],
      languages: 1,
      equipment: [
        "Scroll case with notes",
        "Winter blanket",
        "Common clothes",
        "Herbalism kit",
        "Belt pouch with 5 gp"
      ],
      feature: {
        name: "Discovery",
        description: "Your isolation gave you access to a unique and powerful discovery."
      }
    },
    {
      name: "Noble",
      description: "You understand wealth, power, and privilege. You carry a noble title and your family owns land, collects taxes, and wields significant political influence.",
      skillProficiencies: ["History", "Persuasion"],
      toolProficiencies: ["One type of gaming set"],
      languages: 1,
      equipment: [
        "Fine clothes",
        "Signet ring",
        "Scroll of pedigree",
        "Purse with 25 gp"
      ],
      feature: {
        name: "Position of Privilege",
        description: "Thanks to your noble birth, people are inclined to think the best of you."
      }
    },
    {
      name: "Outlander",
      description: "You grew up in the wilds, far from civilization. You've witnessed the migration of herds larger than forests, survived weather more extreme than any city-dweller could comprehend.",
      skillProficiencies: ["Athletics", "Survival"],
      toolProficiencies: ["One type of musical instrument"],
      languages: 1,
      equipment: [
        "Staff",
        "Hunting trap",
        "Trophy from animal you killed",
        "Traveler's clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "Wanderer",
        description: "You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you."
      }
    },
    {
      name: "Sage",
      description: "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.",
      skillProficiencies: ["Arcana", "History"],
      languages: 2,
      equipment: [
        "Bottle of black ink",
        "Quill",
        "Small knife",
        "Letter from dead colleague",
        "Common clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "Researcher",
        description: "When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it."
      }
    },
    {
      name: "Sailor",
      description: "You sailed on a seagoing vessel for years. In that time, you faced down mighty storms, monsters of the deep, and those who wanted to sink your craft to the bottomless depths.",
      skillProficiencies: ["Athletics", "Perception"],
      toolProficiencies: ["Navigator's tools", "Vehicles (water)"],
      equipment: [
        "Belaying pin (club)",
        "50 feet of silk rope",
        "Lucky charm",
        "Common clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "Ship's Passage",
        description: "When you need to, you can secure free passage on a sailing ship for yourself and your companions."
      }
    },
    {
      name: "Soldier",
      description: "War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques, including how to stay alive on the battlefield.",
      skillProficiencies: ["Athletics", "Intimidation"],
      toolProficiencies: ["One type of gaming set", "Vehicles (land)"],
      equipment: [
        "Insignia of rank",
        "Trophy from fallen enemy",
        "Set of bone dice or deck of cards",
        "Common clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "Military Rank",
        description: "You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence."
      }
    },
    {
      name: "Urchin",
      description: "You grew up on the streets alone, orphaned, and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself.",
      skillProficiencies: ["Sleight of Hand", "Stealth"],
      toolProficiencies: ["Disguise kit", "Thieves' tools"],
      equipment: [
        "Small knife",
        "Map of your home city",
        "Pet mouse",
        "Token from your parents",
        "Common clothes",
        "Belt pouch with 10 gp"
      ],
      feature: {
        name: "City Secrets",
        description: "You know the secret patterns and flow to cities and can find passages through the urban sprawl that others would miss."
      }
    }
  ];
  
  export default backgrounds;