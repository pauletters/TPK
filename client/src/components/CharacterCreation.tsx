import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { BasicInfoSection } from './CharacterCreationSections/BasicInfoSection';
import { AttributesSection } from './CharacterCreationSections/AttributesSection';
import { CombatSection } from './CharacterCreationSections/CombatSection';
import { SkillsSection } from './CharacterCreationSections/SkillsSection';
import { CharacterData } from './types';
import { ADD_CHARACTER } from '../utils/mutations';
import { GET_CHARACTERS } from '../utils/queries';
import '../styles/main.css';

const initialCharacterState: CharacterData = {
  _id: '',
  private: false,
  basicInfo: {
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    avatar: '../assets/avatar1.png',
  },
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  biography: {
    backstory:'',
  },
  combat: {
    armorClass: 10,
    hitPoints: 10,
    initiative: 0,
    speed: 30,
  },
  skills: {
    proficiencies: [],
    savingThrows: [],
  },
  classFeatures: [],
  equipment: [],
  spells: [],
};

const CharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData>(initialCharacterState);
  const navigate = useNavigate();
  const [addCharacter, { error }] = useMutation(ADD_CHARACTER, {
    update(cache, { data: { addCharacter } }) {
      try {
        const { characters } = cache.readQuery({ query: GET_CHARACTERS }) || { characters: [] } as any;
        cache.writeQuery({
          query: GET_CHARACTERS,
          data: { characters: [...characters, addCharacter] }
        });
      } catch (error) {
        console.error('Error updating cache on addCharacter:', error);
      }
    }
  }); 

  // Handler to update character information
  const handleInputChange = (category: keyof CharacterData, field: string, value: any) => {
    setCharacter(prevCharacter => ({
      ...prevCharacter,
      [category]: {
        ...(typeof prevCharacter[category] === 'object' ? prevCharacter[category] : {}),
        [field]: value
      }
    }));
  };

  // Calculate attribute modifiers
  const calculateModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const validateCharacter = () => {
    const { basicInfo } = character;
    if (!basicInfo.name || !basicInfo.race || !basicInfo.class) {
      alert('Please fill in all required basic information (name, race, and class)');
      return false;
    }
    return true;
  };

  const handleSaveCharacter = async () => {
    if (!validateCharacter()) return;
  
    // Exclude the `_id` field from the character object
    const { _id, ...input } = character;
  
    console.log('Saving character:', input);
    try {
      const { data } = await addCharacter({ variables: { input } });
      alert(`Character ${data.addCharacter.basicInfo.name} created.`);
      navigate('/my-characters');
    } catch (error) {
      console.error('Error creating character', error);
    }
  };
  

  const handleCancelCharacter = () => {
    // Confirm before navigating away
    const confirmCancel = window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
    if (confirmCancel) {
      navigate('/my-characters');
    }
  };

  if (error) {
    console.error('Mutation error:', error);
  }

  return (
      <div className="character-sheet">
        <h1 className="text-2xl font-bold mb-6" style={{color: 'white'}}>Character Sheet</h1>
        
        <BasicInfoSection 
          character={character} 
          onInputChange={handleInputChange} 
        />
        
        <AttributesSection 
          character={character} 
          onInputChange={handleInputChange}
          calculateModifier={calculateModifier}
        />
        
        <CombatSection 
          character={character} 
          onInputChange={handleInputChange} 
        />

        <SkillsSection 
          character={character} 
          onInputChange={handleInputChange}
        />

        <div id="character-creation-buttons">
        <button 
            onClick={handleSaveCharacter}
            id="save-character-button"
          >
            Save Character
          </button>
          <button 
            onClick={handleCancelCharacter}
            id="cancel-character-button"
          >
            Cancel
          </button>
        </div>
      </div>
  );
};

export default CharacterSheet;