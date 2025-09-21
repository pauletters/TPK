import React from 'react';
import { SectionProps } from '../types';

export const CombatSection: React.FC<SectionProps> = ({ character, onInputChange }) => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4" style={{color: 'white'}}>Combat</h2>
      <div className="combat-section">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Armor Class
          </label>
          <input 
            type="number"
            value={character.combat.armorClass}
            onChange={(e) => onInputChange('combat', 'armorClass', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            min={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hit Points
          </label>
          <input 
            type="number"
            value={character.combat.hitPoints}
            onChange={(e) => onInputChange('combat', 'hitPoints', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed
          </label>
          <input 
            type="number"
            value={character.combat.speed}
            onChange={(e) => onInputChange('combat', 'speed', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            min={0}
          />
        </div>
      </div>
    </section>
  );
};