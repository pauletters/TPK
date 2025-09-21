import React from 'react';
import { CharacterData } from '../types';

// D&D 5e Skills with their corresponding ability scores
const skillOptions = [
  { name: 'Acrobatics', ability: 'dexterity' },
  { name: 'Animal Handling', ability: 'wisdom' },
  { name: 'Arcana', ability: 'intelligence' },
  { name: 'Athletics', ability: 'strength' },
  { name: 'Deception', ability: 'charisma' },
  { name: 'History', ability: 'intelligence' },
  { name: 'Insight', ability: 'wisdom' },
  { name: 'Intimidation', ability: 'charisma' },
  { name: 'Investigation', ability: 'intelligence' },
  { name: 'Medicine', ability: 'wisdom' },
  { name: 'Nature', ability: 'intelligence' },
  { name: 'Perception', ability: 'wisdom' },
  { name: 'Performance', ability: 'charisma' },
  { name: 'Persuasion', ability: 'charisma' },
  { name: 'Religion', ability: 'intelligence' },
  { name: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'Stealth', ability: 'dexterity' },
  { name: 'Survival', ability: 'wisdom' }
];

interface SkillsSectionProps {
  character: CharacterData;
  onInputChange: (category: keyof CharacterData, field: string, value: any) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ character, onInputChange }) => {
  // Handle skill proficiency toggle
  const handleSkillToggle = (skillName: string) => {
    const currentProficiencies = character.skills.proficiencies || [];
    const updatedProficiencies = currentProficiencies.includes(skillName)
      ? currentProficiencies.filter(skill => skill !== skillName)
      : [...currentProficiencies, skillName];
    
    onInputChange('skills', 'proficiencies', updatedProficiencies);
  };

  return (
    <section className="skills-container">
      <h2 className="text-xl font-semibold mb-4" style={{color: 'white'}}>Skills</h2>
      <div className="skills-section">
        {skillOptions.map((skill) => (
          <div key={skill.name} className="flex items-center mb-2">
            <input 
              type="checkbox"
              id={skill.name.toLowerCase().replace(/\s+/g, '-')}
              checked={(character.skills.proficiencies || []).includes(skill.name)}
              onChange={() => handleSkillToggle(skill.name)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              style={{ marginRight: '8px' }}
            />
            <label 
              htmlFor={skill.name.toLowerCase().replace(/\s+/g, '-')}
              className="text-sm font-medium text-gray-700 flex-grow"
            >
              {skill.name} ({skill.ability.charAt(0).toUpperCase() + skill.ability.slice(1)})
            </label>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Select the skills your character is proficient in. 
        The number of skills you can choose depends on your class and background.
      </p>
    </section>
  );
};