import React from 'react';
import CharacterSheet from '../components/CharacterCreation';

const CharacterSheetPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Your Character</h1>
      <CharacterSheet />
    </div>
  );
};

export default CharacterSheetPage;