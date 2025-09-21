import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
    }
  }
`;

export const GET_CHARACTERS = gql`
  query GetCharacters {
    characters {
      _id
      basicInfo {
        name
        class
        level
        avatar
      }
    }
  }
`;

export const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
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
      biography {
        backstory
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
      classFeatures {
        name
        description
        levelRequired
        selections {
          featureName
          selectedOption
        }
      }
      private
    }
  }
`;

export const GET_CHARACTER_FEATURES = gql`
  query GetCharacterFeatures($characterId: ID!) {
    character(id: $characterId) {
      _id
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

export const SEARCH_USERS = gql`
  query SearchUsers($term: String!) {
    searchUsers(term: $term) {
      _id
      username
      characters {
        _id
        basicInfo {
          name
        }
      }
    }
  }
`;
