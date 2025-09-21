const typeDefs = `
    type User {
        _id: ID!
        username: String!
        email: String!
        characters: [Character!]!
        campaigns: [Campaign!]!
    }

    type BasicInfo {
        name: String!
        race: String!
        class: String!
        level: Int!
        background: String
        alignment: String
        avatar: String
        isCustomAvatar: Boolean
    }

    type Attributes {
        strength: Int!
        dexterity: Int!
        constitution: Int!
        intelligence: Int!
        wisdom: Int!
        charisma: Int!
    }

    type Combat {
        armorClass: Int!
        hitPoints: Int!
        initiative: Int!
        speed: Int!
    }

    type Skills {
        proficiencies: [String!]!
        savingThrows: [String!]!
    }

    type Spell {
        name: String!
        level: Int!
        prepared: Boolean!
    }

    type Cost {
        quantity: Float!
        unit: String!
    }

    type Equipment {
        name: String!
        category: String!
        cost: Cost
        weight: Float
        description: [String!]
        properties: [String!]
    }

    type FeatureSelection {
        featureName: String!
        selectedOption: String!
    }

    type ClassFeature {
        name: String!
        description: String!
        levelRequired: Int!
        selections: [FeatureSelection]
    }
    
    type Biography {
        alignment: String
        background: String
        languages: [String]
        backstory: String
    }   

    input FeatureSelectionInput {
        featureName: String!
        selectedOption: String!
    }

    type Character {
        _id: ID!
        player: User!
        basicInfo: BasicInfo!
        attributes: Attributes!
        combat: Combat
        skills: Skills
        equipment: [Equipment!]
        spells: [Spell!]!
        classFeatures: [ClassFeature]!
        private: Boolean!
        createdAt: String!
        updatedAt: String!
        biography: Biography!
    }

    type Campaign {
        _id: ID!
        name: String!
        description: String
        players: [Character!]!
        milestones: [String!]!
        createdBy: User!
        playerCount: Int!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        me: User
        characters: [Character!]!
        character(id: ID!): Character
        campaigns(private: Boolean): [Campaign!]!
        campaign(id: ID!, includePrivate: Boolean = false): Campaign
        searchUsers(term: String!): [User!]!
    }

    type Mutation {
        loginUser(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addCharacter(input: AddCharacterInput!): Character
        updateCharacter(input: UpdateCharacterInput!): Character
        updateCharacterSpells(id: ID!, spells: [SpellInput]!): Character!
        updateCharacterEquipment(id: ID!, equipment: [EquipmentInput!]!): Character!
        updateCharacterFeatures(characterId: ID!, features: [FeatureSelectionInput!]!): Character!
        toggleSpellPrepared(id: ID!, spellName: String!): Character!
        deleteCharacter(id: ID!): Character

        addCampaign(
            name: String!
            description: String
            players: [ID!]!
        ): Campaign

        updateCampaign(
            id: ID!
            name: String
            description: String
            addPlayers: [ID!]
            removePlayers: [ID!]
            addMilestones: [String!]
            removeMilestoneIndex: Int
        ): Campaign

        deleteCampaign(id: ID!): Campaign
    }

    input BiographyInput {
        alignment: String
        background: String
        languages: [String]
        backstory: String!
    }

    input BasicInfoInput {
        name: String!
        race: String!
        class: String!
        level: Int!
        background: String
        alignment: String
        avatar: String
        isCustomAvatar: Boolean
    }

    input AttributesInput {
        strength: Int!
        dexterity: Int!
        constitution: Int!
        intelligence: Int!
        wisdom: Int!
        charisma: Int!
    }

    input CombatInput {
        armorClass: Int!
        hitPoints: Int!
        initiative: Int!
        speed: Int!
    }

    input SkillsInput {
        proficiencies: [String!]!
        savingThrows: [String!]!
    }

    input AddCharacterInput {
        basicInfo: BasicInfoInput!
        attributes: AttributesInput!
        combat: CombatInput
        skills: SkillsInput
        classFeatures: [String!]
        equipment: [EquipmentInput!]!
        spells: [SpellInput!]
        biography: BiographyInput
        private: Boolean
    }

    input UpdateCharacterInput {
        id: ID!
        basicInfo: BasicInfoInput
        attributes: AttributesInput
        combat: CombatInput
        skills: SkillsInput
        equipment: [EquipmentInput!]
        spells: [SpellInput!]
        private: Boolean
        biography: BiographyInput
    }

    input SpellInput {
        name: String!
        level: Int!
        prepared: Boolean!
    }


    type Cost {
        quantity: Float!
        unit: String!
    }

    type Equipment {
        name: String!
        category: String!
        cost: Cost
        weight: Float
        description: [String!]
        properties: [String!]
    }


    input CostInput {
        quantity: Float!
        unit: String!
    }

    input EquipmentInput {
        name: String!
        category: String!
        cost: CostInput
        weight: Float
        description: [String!]
        properties: [String!]
    }

    type Auth {
        token: ID!
        user: User!
    }
`;

export default typeDefs;
