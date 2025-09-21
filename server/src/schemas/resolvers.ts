import User from '../models/User.js';
import Character from '../models/Character.js';
import { ISpell } from '../models/Character.js';
import Campaign from '../models/Campaign.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';

// Interfaces
interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface AddCharacterArgs {
  basicInfo: {
    name: string;
    race: string;
    class: string;
    level: number;
    background?: string;
    alignment?: string;
    avatar: string;
  };
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  combat?: {
    armorClass: number;
    hitPoints: number;
    initiative: number;
    speed: number;
  };
  skills?: {
    proficiencies: string[];
    savingThrows: string[];
  };
  equipment?: string[];
  spells: CharacterSpell[];
  private?: boolean; // Optional field
}

interface UpdateCharacterArgs extends Partial<AddCharacterArgs> {
  biography: any;
  id: string;
}

interface AddCampaignArgs {
  name: string;
  description?: string;
  players: string[]; // Character IDs
}

interface UpdateCampaignArgs {
  id: string;
  name?: string;
  description?: string;
  addPlayers?: string[];
  removePlayers?: string[];
  addMilestones?: string[]; // Array of milestones to add
  removeMilestoneIndex?: number; // Index of the milestone to remove
}

interface Context {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface CharacterSpell {
  name: string;
  level: number;
  prepared: boolean;
}

interface SpellInput {
  name: string;
  level: number;
  prepared: boolean;
}

interface UpdateSpellsArgs {
  id: string;
  spells: SpellInput[];
}

interface Equipment {
  name: string;
  category: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  description?: string[];
  properties?: string[];
}

// Resolvers
const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      return User.findById(context.user._id)
        .populate('characters campaigns')
        .exec();
    },

    characters: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      return Character.find({ player: context.user._id }).exec();
    },

    character: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const character = await Character.findOne({ _id: id, player: context.user._id });
      console.log('Character from DB:', JSON.stringify(character, null, 2));
      
      if (!character) {
        throw new GraphQLError('Character not found or unauthorized', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return character;
    },
  

    campaigns: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const userCharacters = await Character.find({ player: context.user._id }).select('_id').exec();
      return Campaign.find({
        $or: [
          { createdBy: context.user._id },
          { players: { $in: userCharacters.map((char) => char._id) } },
        ],
      })
        .populate({
          path: 'players',
          populate: { path: 'player', select: 'username' },
        })
        .populate('createdBy', 'username')
        .exec();
    },

    campaign: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      return Campaign.findById(id)
        .populate({
          path: 'players',
          populate: { path: 'player', select: 'username' },
        })
        .populate('createdBy', 'username')
        .exec();
    },

    searchUsers: async (_parent: unknown, { term }: { term: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const users = await User.find({
        username: { $regex: term, $options: 'i' },
      })
        .populate({ path: 'characters', select: 'basicInfo.name private' })
        .select('-password -__v');

      return users;
    },
  },

  Character: {
    classFeatures: (parent: any) => {
      return parent.classFeatures || [];
    }
  },

  Mutation: {
    loginUser: async (_parent: unknown, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addUser: async (_parent: unknown, { username, email, password }: AddUserArgs) => {
      if (await User.findOne({ $or: [{ username }, { email }] })) {
        throw new GraphQLError('Username or email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addCharacter: async (_parent: unknown, { input }: { input: AddCharacterArgs }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
        
      const newCharacter = await Character.create({
        ...input,
        player: context.user._id,
        private: input.private ?? true, // Default to true if not provided
      });

      await User.findByIdAndUpdate(
        context.user._id,
        { $push: { characters: newCharacter._id } },
        { new: true }
      );

      return newCharacter;
    },

    updateCharacter: async (_parent: unknown, { input }: { input: UpdateCharacterArgs }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
    
      // Validate the character ID
      if (!mongoose.Types.ObjectId.isValid(input.id)) {
        throw new GraphQLError('Invalid character ID', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    
      // Find the character and check ownership
      const character = await Character.findOne({ _id: input.id, player: context.user._id });
      if (!character) {
        throw new GraphQLError('Character not found or unauthorized', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
    
      // Prepare the update object
      const updateFields: any = {};
    
      // Update the fields that exist in the input
      if (input.basicInfo) {
        updateFields.basicInfo = input.basicInfo;
      }
      if (input.attributes) {
        updateFields.attributes = input.attributes;
      }
      if (input.combat) {
        updateFields.combat = input.combat;
      }
      if (input.skills) {
        updateFields.skills = input.skills;
      }
      if (input.equipment) {
        // Update the equipment field with the provided new data
        updateFields.equipment = input.equipment; 
      }
      if (input.spells) {
        updateFields.spells = input.spells;
      }
      if (input.biography && 'backstory' in input.biography) {
        console.log('Updating backstory:', input.biography.backstory);
        updateFields['biography.backstory'] = input.biography.backstory.trim();
      }
      
      if (input.private !== undefined) {
        updateFields.private = input.private;
      }
    
      // Update the character with the new values
      const updatedCharacter = await Character.findOneAndUpdate(
        { _id: input.id, player: context.user._id },
        { $set: updateFields }, // Only update the fields that have changed
        { new: true, runValidators: true }
      );
    
      if (!updatedCharacter) {
        throw new GraphQLError('Failed to update character', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    
      return updatedCharacter;
    },
    
    
      
    updateCharacterSpells: async (
      _parent: unknown,
      { id, spells }: UpdateSpellsArgs,
      context: Context
    ) => {
      console.log('Starting updateCharacterSpells with:', { id, spells });

      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid character ID', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Clean and validate each spell
      const cleanedSpells = spells.map(spell => {
        if (!spell || typeof spell !== 'object') {
          throw new GraphQLError('Invalid spell object', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        if (!spell.name || typeof spell.name !== 'string') {
          throw new GraphQLError('Spell name is required and must be a string', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        if (typeof spell.level !== 'number' || spell.level < 0 || spell.level > 9) {
          throw new GraphQLError('Spell level must be a number between 0 and 9', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        return {
          name: spell.name.trim(),
          level: spell.level,
          prepared: Boolean(spell.prepared)
        };
      });

      try {
        console.log('Looking for character:', { id, userId: context.user._id });

        const character = await Character.findOneAndUpdate(
          { _id: id, player: context.user._id },
          { $set: { spells: cleanedSpells } },
          { 
            new: true, 
            runValidators: true,
            lean: false 
          }
        );

        if (!character) {
          throw new GraphQLError('Character not found or unauthorized', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        console.log('Updated character:', {
          id: character._id,
          spellCount: character.spells?.length || 0
        });

        return character;

      } catch (error) {
        console.error('Error in updateCharacterSpells:', error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          'Failed to update spells: ' + (error instanceof Error ? error.message : 'Unknown error'),
          { extensions: { code: 'INTERNAL_SERVER_ERROR' } }
        );
      }
    },

    toggleSpellPrepared: async (_parent: unknown, { id, spellName }: { id: string; spellName: string }, context: Context) => {
      console.log('Starting toggleSpellPrepared with:', { id, spellName });
      
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
    
      try {
        // First find the current spell state
        const currentCharacter = await Character.findOne({
          _id: id,
          player: context.user._id,
          'spells.name': spellName
        });
    
        if (!currentCharacter || !currentCharacter.spells) {
          throw new GraphQLError('Character or spells not found');
        }
    
        const spell = currentCharacter.spells.find(s => s.name === spellName);
        if (!spell) {
          throw new GraphQLError('Spell not found');
        }
    
        // Now update with the opposite of the current prepared state
        const updatedCharacter = await Character.findOneAndUpdate(
          {
            _id: id,
            player: context.user._id,
            'spells.name': spellName
          },
          {
            $set: {
              'spells.$.prepared': !spell.prepared
            }
          },
          {
            new: true, // Return the updated document
            runValidators: true
          }
        ).exec();
    
        if (!updatedCharacter) {
          throw new GraphQLError('Failed to update character');
        }
    
        // Log the result before returning
        console.log('Successfully updated character:', {
          id: updatedCharacter._id,
          spellName,
          newPreparedState: updatedCharacter.spells?.find(s => s.name === spellName)?.prepared
        });
    
        return updatedCharacter;
      } catch (error) {
        console.error('Error in toggleSpellPrepared:', error);
        throw error instanceof GraphQLError ? error : new GraphQLError(
          'Failed to toggle spell prepared status'
        );
      }
    },

    updateCharacterFeatures: async (
      _parent: unknown,
      { characterId, features }: { characterId: string; features: { featureName: string; selectedOption: string }[] },
      context: Context
    ) => {
      console.log('Starting updateCharacterFeatures:', { characterId, features });
      
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
  
      try {
        // Find the character
        const character = await Character.findOne({
          _id: characterId,
          player: context.user._id
        });
  
        if (!character) {
          throw new GraphQLError('Character not found');
        }
  
        // Create the new features array
        const newFeatures = features.map((feature: { featureName: string; selectedOption: string }) => ({
          name: feature.featureName,
          description: "", // You might want to get this from your allClassFeatures data
          levelRequired: 1, // You might want to get this from your allClassFeatures data
          selections: [{
            featureName: feature.featureName,
            selectedOption: feature.selectedOption
          }]
        }));
  
        // Update character with new features
        const updatedCharacter = await Character.findOneAndUpdate(
          { _id: characterId },
          { 
            $set: { 
              classFeatures: newFeatures,
              updatedAt: new Date()
            }
          },
          { 
            new: true,
            runValidators: true
          }
        );
  
        if (!updatedCharacter) {
          throw new GraphQLError('Failed to update character');
        }
  
        console.log('Successfully updated character:', updatedCharacter._id);
        return updatedCharacter;
  
      } catch (error) {
        console.error('Error in updateCharacterFeatures:', error);
        throw error;
      }
    },


    deleteCharacter: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const character = await Character.findOneAndDelete({ _id: id, player: context.user._id }).exec();

      if (!character) {
        throw new GraphQLError('Character not found or unauthorized', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return character;
    },

    addCampaign: async (_parent: unknown, { name, description, players }: AddCampaignArgs, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const validCharacters = await Character.find({ _id: { $in: players } }).exec();
      if (validCharacters.length !== players.length) {
        throw new GraphQLError('Some character IDs are invalid', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const newCampaign = await Campaign.create({
        name,
        description,
        players,
        createdBy: context.user._id,
      });

      await User.findByIdAndUpdate(
        context.user._id,
        { $push: { campaigns: newCampaign._id } },
        { new: true }
      );

      return Campaign.findById(newCampaign._id)
        .populate({
          path: 'players',
          populate: { path: 'player', select: 'username' },
        })
        .populate('createdBy', 'username')
        .exec();
    },

    updateCampaign: async (
      _parent: unknown,
      { id, name, description, addPlayers, removePlayers, addMilestones, removeMilestoneIndex }: UpdateCampaignArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
    
      // Fetch campaign with validation
      const campaign = await Campaign.findOne({ _id: id, createdBy: context.user._id });
    
      if (!campaign) {
        throw new GraphQLError('Campaign not found or unauthorized', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
    
      // Add players if provided
      if (addPlayers) {
        const validAdditions = await Character.find({ _id: { $in: addPlayers } });
        if (validAdditions.length !== addPlayers.length) {
          throw new GraphQLError('Some character IDs in addPlayers are invalid', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        // Ensure immutability by creating a new array
        campaign.players = [
          ...campaign.players.map((player) => player.toString()),
          ...validAdditions.map((char) => char._id.toString()),
        ];
      }
    
      // Remove players if provided
      if (removePlayers) {
        // Ensure immutability by creating a new array
        campaign.players = campaign.players
          .map((player) => player.toString())
          .filter((playerId) => !removePlayers.includes(playerId));
      }
    
      // Add milestones if provided
      if (addMilestones) {
        campaign.milestones.push(...addMilestones);
      }
    
      // Remove milestone by index if provided
      if (typeof removeMilestoneIndex === 'number') {
        if (
          removeMilestoneIndex < 0 ||
          removeMilestoneIndex >= campaign.milestones.length
        ) {
          throw new GraphQLError('Invalid milestone index', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        campaign.milestones.splice(removeMilestoneIndex, 1);
      }
    
      // Update name and description if provided
      if (name) {
        campaign.name = name;
      }
    
      if (description) {
        campaign.description = description;
      }
    
      // Save campaign and populate required fields
      const updatedCampaign = await campaign.save();
    
      return updatedCampaign.populate([
        {
          path: 'players',
          populate: { path: 'player', select: 'username' },
        },
        {
          path: 'createdBy',
          select: '_id username',
        },
      ]);
    },
    

    deleteCampaign: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const deletedCampaign = await Campaign.findOneAndDelete({ _id: id, createdBy: context.user._id }).exec();

      if (deletedCampaign) {
        await User.updateMany(
          { campaigns: deletedCampaign._id },
          { $pull: { campaigns: deletedCampaign._id } }
        );
      }

      return deletedCampaign;
    },

    updateCharacterEquipment: async (
      _parent: unknown,
      { id, equipment }: { id: string; equipment: Equipment[] },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
    
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid character ID', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    
      // Find the character and ensure the user owns it
      const character = await Character.findOne({ _id: id, player: context.user._id });
    
      if (!character) {
        throw new GraphQLError('Character not found or unauthorized', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
    
      // Clean up and prepare the equipment array
      const cleanedEquipment = equipment.map(item => ({
        name: item.name,
        category: item.category,
        cost: item.cost ? {
          quantity: item.cost.quantity,
          unit: item.cost.unit
        } : null,
        weight: item.weight || 0,
        description: item.description || [],
        properties: Array.isArray(item.properties)
          ? item.properties.map(prop =>
              typeof prop === 'object' && (prop as { name: string }).name ? (prop as { name: string }).name : String(prop)
            )
          : [], // Normalize properties to string[]
      }));
    
      // Update the equipment list on the character object
      const updatedCharacter = await Character.findOneAndUpdate(
        { _id: id, player: context.user._id },
        { $set: { equipment: cleanedEquipment } }, // Replaces the entire equipment list with the new one
        { new: true, runValidators: true }
      );
    
      if (!updatedCharacter) {
        throw new GraphQLError('Failed to update character equipment', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    
      return updatedCharacter;
    },
    
    
    
    
    
  },

  Campaign: {
    playerCount: (parent: any) => parent.players.length,
  },
};

export default resolvers;
