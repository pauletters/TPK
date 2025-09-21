import React from 'react';
import { AttributesSectionProps } from '../types';

export const AttributesSection: React.FC<AttributesSectionProps> = ({ 
  character, 
  onInputChange, 
  calculateModifier 
}) => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4" style={{color: 'white'}}>Attributes</h2>
      <div className="attributes-section">
        {Object.entries(character.attributes).map(([attr, score]) => (
          <div key={attr} className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {attr}
            </label>
            <input 
              type="number"
              value={score}
              onChange={(e) => onInputChange('attributes', attr, parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-center focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min={1}
              max={30}
            />
            <div className="text-sm text-gray-500 mt-1">
              Modifier: {calculateModifier(score)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};