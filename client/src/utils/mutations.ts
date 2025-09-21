import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_CHARACTER = gql`
  mutation AddCharacter($input: AddCharacterInput!) {
    addCharacter(input: $input) {
      _id
      basicInfo {
        name
        class
        race
        level
        background
        alignment
        avatar
      }
      attributes {
        strength
        dexterity
        constitution
        intelligence
        wisdom
        charisma
      }
      combat {
        armorClass
        hitPoints
        initiative
        speed
      }
      skills {
        proficiencies
        savingThrows
      }
      equipment {
        name
        category
        cost {
          quantity
          unit
        }
        weight
        description
        properties
      }
      spells {
        name
        level
        prepared
      }
    }
  }
`;

export const DELETE_CHARACTER = gql`
  mutation DeleteCharacter($id: ID!) {
    deleteCharacter(id: $id) {
      _id
    }
  }
`;

export const UPDATE_CHARACTER_SPELLS = gql`
  mutation UpdateCharacterSpells($id: ID!, $spells: [SpellInput!]!) {
    updateCharacterSpells(id: $id, spells: $spells) {
      _id
      basicInfo {
        name
      }
      spells {
        name
        level
        prepared
      }
    }
  }
`;

export const TOGGLE_SPELL_PREPARED = gql`
  mutation ToggleSpellPrepared($id: ID!, $spellName: String!) {
    toggleSpellPrepared(id: $id, spellName: $spellName) {
      _id
      spells {
        name
        level
        prepared
      }
    }
  }
`;

export const UPDATE_CHARACTER_EQUIPMENT = gql`
  mutation UpdateCharacterEquipment($id: ID!, $equipment: [EquipmentInput!]!) {
    updateCharacterEquipment(id: $id, equipment: $equipment) {
      _id
      equipment {
        name
        category
        cost {
          quantity
          unit
        }
        weight
        description
        properties
      }
    }
  }
`;

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign(
    $id: ID!
    $name: String
    $description: String
    $addPlayers: [ID!]
    $removePlayers: [ID!]
    $addMilestones: [String!]
    $removeMilestoneIndex: Int
  ) {
    updateCampaign(
      id: $id
      name: $name
      description: $description
      addPlayers: $addPlayers
      removePlayers: $removePlayers
      addMilestones: $addMilestones
      removeMilestoneIndex: $removeMilestoneIndex
    ) {
      _id
      name
      description
      milestones
      players {
        _id
        basicInfo {
          name
        }
        player {
          username
        }
      }
      createdBy {
        _id
        username
      }
    }
  }
`;

export const UPDATE_CHARACTER_FEATURES = gql`
  mutation UpdateCharacterFeatures($characterId: ID!, $features: [FeatureSelectionInput!]!) {
    updateCharacterFeatures(characterId: $characterId, features: $features) {
      _id
      basicInfo {
        name
        class
        level
      }
      classFeatures {
        name
        description
        levelRequired
        selections {
          featureName
          selectedOption
        }
      }
    }
  }
`;

export const UPDATE_CHARACTER_PROFICIENCIES = gql`
  mutation UpdateCharacterProficiencies($id: ID!, $proficiencies: [ProficiencySelectionInput!]!) {
    updateCharacterProficiencies(id: $id, proficiencies: $proficiencies) {
      _id
      skills {
        proficiencies
      }
      classFeatures {
        name
        selections {
          featureName
          selectedOption
        }
      }
    }
  }
`;

export const UPDATE_CHARACTER = gql`
 mutation UpdateCharacter($input: UpdateCharacterInput!) {
  updateCharacter(input: $input) {
    _id
    basicInfo {
      name
      race
      class
      level
      background
      alignment
      avatar
    }
    attributes {
      strength
      dexterity
      constitution
      intelligence
      wisdom
      charisma
    }
    combat {
      armorClass
      hitPoints
      initiative
      speed
    }
    skills {
      proficiencies
      savingThrows
    }
    equipment {
      name
      category
      cost {
        quantity
        unit
      }
      weight
      description
      properties
    }
    spells {
      name
      level
      prepared
    }
    biography {
      alignment
      background
      languages
      backstory
    }
  }
}
`;

export const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id) {
      _id
      name
      description
    }
  }
`;

