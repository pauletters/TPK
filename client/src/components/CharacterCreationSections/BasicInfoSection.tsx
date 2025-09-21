import React, { useMemo } from 'react';
import { SectionProps } from '../types';
import '../../styles/avatar.css';
import '../../styles/main.css';
import AvatarSelector from './AvatarSelector';

const raceOptions = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Halfling', 
  'Half-Orc', 'Human', 'Tiefling'
];

const classOptions = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard'
];

const backgroundOptions = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer',
  'Folk Hero', 'Guild Artisan', 'Hermit', 'Noble',
  'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'
];

const alignmentOptions = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

const classSkillProficiencies = {
  fighter: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
  wizard: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
  rogue: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
  cleric: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
  bard: ['Any'],
  ranger: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
  paladin: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
  sorcerer: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
  monk: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
  druid: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
  warlock: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
  barbarian: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival']
};

// Mapping of classes to their skill proficiency selection rules
const skillList = {
  'Acrobatics': 'Acrobatics',
  'Animal Handling': 'Animal Handling',
  'Arcana': 'Arcana',
  'Athletics': 'Athletics',
  'Deception': 'Deception',
  'History': 'History',
  'Insight': 'Insight',
  'Intimidation': 'Intimidation',
  'Investigation': 'Investigation',
  'Medicine': 'Medicine',
  'Nature': 'Nature',
  'Perception': 'Perception',
  'Performance': 'Performance',
  'Persuasion': 'Persuasion',
  'Religion': 'Religion',
  'Sleight of Hand': 'Sleight of Hand',
  'Stealth': 'Stealth',
  'Survival': 'Survival'
};

const classSkillProficiencyRules = {
  barbarian: { count: 2, skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  bard: { count: 3, skills: Object.keys(skillList).filter(skill => skill !== 'Stealth') }, // All skills except Stealth
  cleric: { count: 2, skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  druid: { count: 2, skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  fighter: { count: 2, skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  monk: { count: 2, skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  paladin: { count: 2, skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  ranger: { count: 3, skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  rogue: { count: 4, skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  sorcerer: { count: 2, skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  warlock: { count: 2, skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  wizard: { count: 2, skills: ['Arcana', 'History', 'Investigation', 'Medicine', 'Religion'] }
};

// Function to get skill proficiency details for a given class
export const getClassSkillProficiencies = (characterClass: string) => {
  const normalizedClass = characterClass.toLowerCase();
  const classRules = classSkillProficiencyRules[normalizedClass as ClassType];
  
  if (!classRules) {
    console.warn(`No skill proficiency rules found for class ${characterClass}`);
    return { 
      count: 0, 
      skills: [],
      message: `No skill proficiency information available for ${characterClass}`
    };
  }

  return {
    count: classRules.count,
    skills: classRules.skills,
    message: `Select ${classRules.count} skill${classRules.count !== 1 ? 's' : ''} from the following list`
  };
};

type ClassType = 'fighter' | 'wizard' | 'rogue' | 'cleric' | 'bard' | 'ranger' | 'paladin' | 'sorcerer' | 'monk' | 'druid' | 'warlock' | 'barbarian';
type BackgroundType = 'acolyte' | 'charlatan' | 'criminal' | 'entertainer' | 'folk hero' | 'guild artisan' | 'hermit' | 'noble' | 'outlander' | 'sage' | 'sailor' | 'soldier' | 'urchin';

const backgroundSkillProficiencies: Record<BackgroundType, string[]> = {
  acolyte: ['Insight', 'Religion'],
  charlatan: ['Deception', 'Sleight of Hand'],
  criminal: ['Deception', 'Stealth'],
  entertainer: ['Acrobatics', 'Performance'],
  'folk hero': ['Animal Handling', 'Survival'],
  'guild artisan': ['Insight', 'Persuasion'],
  hermit: ['Medicine', 'Religion'],
  noble: ['History', 'Persuasion'],
  outlander: ['Athletics', 'Survival'],
  sage: ['Arcana', 'History'],
  sailor: ['Athletics', 'Perception'],
  soldier: ['Athletics', 'Intimidation'],
  urchin: ['Sleight of Hand', 'Stealth']
};

export const BasicInfoSection: React.FC<SectionProps> = ({ character, onInputChange }) => {
  const availableSkills = useMemo(() => {
    const classSkills = character.basicInfo.class ? 
      classSkillProficiencies[character.basicInfo.class.toLowerCase() as ClassType] || [] : [];
    const backgroundSkills = character.basicInfo.background ? 
      backgroundSkillProficiencies[character.basicInfo.background.toLowerCase() as BackgroundType] || [] : [];
    
    return {
      classSkills,
      backgroundSkills,
      allSkills: [...new Set([...classSkills, ...backgroundSkills])]
    };
  }, [character.basicInfo.class, character.basicInfo.background]);

  return (
    <section className="mb-6">
      <h2 className="text-xl mb-4" style={{color: 'white'}}>Basic Information</h2>
      <div className="basic-info-grid">
        {/* Left column with inputs - now with max width */}
        <div className="basic-info-input">
          <div>
            <label className="block text-sm font-medium font-bold mb-2">
              Character Name
            </label>
            <input 
              type="text"
              value={character.basicInfo.name}
              onChange={(e) => onInputChange('basicInfo', 'name', e.target.value)}
              placeholder="Enter character name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Race
            </label>
            <select 
              value={character.basicInfo.race}
              onChange={(e) => onInputChange('basicInfo', 'race', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Race</option>
              {raceOptions.map(race => (
                <option key={race.toLowerCase()} value={race.toLowerCase()}>
                  {race}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select 
              value={character.basicInfo.class}
              onChange={(e) => onInputChange('basicInfo', 'class', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls.toLowerCase()} value={cls.toLowerCase()}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background
            </label>
            <select 
              value={character.basicInfo.background}
              onChange={(e) => onInputChange('basicInfo', 'background', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Background</option>
              {backgroundOptions.map(background => (
                <option key={background.toLowerCase()} value={background.toLowerCase()}>
                  {background}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select 
              value={character.basicInfo.alignment}
              onChange={(e) => onInputChange('basicInfo', 'alignment', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Alignment</option>
              {alignmentOptions.map(alignment => (
                <option key={alignment.toLowerCase()} value={alignment.toLowerCase()}>
                  {alignment}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right column with avatar selector */}
        <div className="flex-1">
          <div className="avatar-container">
            <AvatarSelector
              selectedAvatar={character.basicInfo.avatar}
              onAvatarChange={(avatar: string) => onInputChange('basicInfo', 'avatar', avatar)}
            />
          </div>
        </div>
      </div>

      {/* Skill Proficiencies section */}
      {(character.basicInfo.class || character.basicInfo.background) && (
         <div className="mt-6">
         <br/>
         <h5 className="text-sm font-medium text-gray-700 mb-2" style={{color: 'white'}}>Available Skill Proficiencies</h5>
         <div className="grid grid-cols-2 gap-4" style={{display: 'flex', justifyContent: 'center'}}>
           {character.basicInfo.class && (
             <div className="border rounded p-3">
               <span className="font-medium">{character.basicInfo.class.charAt(0).toUpperCase() + character.basicInfo.class.slice(1).toLowerCase()}:</span>{' '}
               <div>
                 {(() => {
                   const classSkills = getClassSkillProficiencies(character.basicInfo.class);
                   return (
                     <>
                       <p className="text-gray-600 mb-2">{classSkills.message}</p>
                       <span className="text-gray-600">
                         {classSkills.skills.join(', ')}
                       </span>
                     </>
                   );
                 })()}
               </div>
             </div>
           )}
           {character.basicInfo.background && (
              <div className="border rounded p-3">
              <span className="font-medium">
                {character.basicInfo.background.charAt(0).toUpperCase() + character.basicInfo.background.slice(1).toLowerCase()}:
              </span>{' '}
              <div>
                <p className="text-gray-600 mb-2">
                  Optional proficiencies from your background
                </p>
                <span className="text-gray-600">
                  {availableSkills.backgroundSkills.join(', ')}
                </span>
              </div>
            </div>
           )}
         </div>
       </div>
      )}
    </section>
  );
};

export default BasicInfoSection;