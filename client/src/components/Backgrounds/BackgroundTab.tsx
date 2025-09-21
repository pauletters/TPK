import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { UPDATE_CHARACTER } from '../../utils/mutations'; // Import the mutation
import { GET_CHARACTER } from '../../utils/queries'; // Import the query
import { backgrounds } from './Backgrounds';

interface Character {
  _id: string;
  basicInfo: {
    background?: string;
  };
  biography: {
    backstory: string;
  };
}

interface BackgroundTabProps {
  character: Character;
  characterBackground: string;
  onBackstoryChange?: (backstory: string) => void;
  onInputChange: (field: any, value: any) => void;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({ character }) => {
  const [backstory, setBackstory] = useState(character.biography.backstory || ''); // Track the backstory state
  const [isEditing, setIsEditing] = useState(false);  // Track if we are in editing mode
  const [updateCharacter] = useMutation(UPDATE_CHARACTER);

  // Log the character prop to ensure it's passed correctly
  useEffect(() => {
    console.log('Character prop:', character);

    if (character && character.biography && character.biography.backstory) {
      setBackstory(character.biography.backstory);
    }
  }, [character]);

  // Find the selected background data
  const selectedBackground = backgrounds.find(
    bg => bg.name.toLowerCase() === character.basicInfo.background?.toLowerCase()
  ) || {
    name: '',
    description: '',
    equipment: [],
    feature: { name: '', description: '' }
  };

  const handleBackstoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBackstory = e.target.value;
    setBackstory(newBackstory);
  };

  const handleSubmitBackstory = async () => {
    try {
      if (!character._id) {
        throw new Error('Character ID is missing');
      }
  
      const updatedBiography = {
        backstory: backstory.trim() === '' ? '' : backstory.trim(), // Only send backstory if others are unchanged
      };
      
      const input = {
        id: character._id,
        biography: updatedBiography,  // Only include the backstory in the mutation
      };
      
      await updateCharacter({
        variables: { input },
        refetchQueries: [{ query: GET_CHARACTER, variables: { id: character._id } }],
      });
  
      setIsEditing(false);  // Switch to view mode after submitting the changes
  
    } catch (error) {
      console.error('Error submitting backstory:', error);
      alert('Failed to update backstory. Please try again.');
    }
  };
  
  return (
    <div className="flex flex-col h-full space-y-6">
      <Card className="mb-4">
        <Card.Header>
          <div className="background-name-header">
            <h3 className="text-xl mb-0 text-center text-white">
              {selectedBackground.name || 'None Selected'}
            </h3>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {selectedBackground.name ? (
              <>
                <div>
                  <h5 className="text-lg font-medium mb-2">Description</h5>
                  <p className="text-gray-700">{selectedBackground.description}</p>
                </div>

                <div>
                  <h5 className="text-lg font-medium mb-2">Starter Background Equipment</h5>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedBackground.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {selectedBackground.feature && (
                  <div>
                    <h5 className="text-lg font-medium mb-2">Special Feature: {selectedBackground.feature.name}</h5>
                    <p className="text-gray-700">{selectedBackground.feature.description}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center">Select a background in the character creation tab to see details</p>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="flex-grow">
        <Card.Header>
          <h3 className="text-xl font-semibold text-white">Character Backstory</h3>
        </Card.Header>
        <Card.Body className="h-full">
          {isEditing ? (
            <>
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  padding: '12px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
                placeholder="Write your character's backstory here..."
                value={backstory}
                onChange={handleBackstoryChange}
              />
              <Button onClick={handleSubmitBackstory} className="mt-3">
                Save Backstory
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-700">{backstory || 'No backstory available'}</p>
              <Button onClick={() => setIsEditing(true)} className="mt-3">
                Edit Backstory
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BackgroundTab;
