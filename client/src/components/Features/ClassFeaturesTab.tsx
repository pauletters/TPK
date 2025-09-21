import React, { useState, useEffect } from 'react';
import { Card, Accordion } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_CHARACTER_FEATURES } from '../../utils/mutations';
import { GET_CHARACTER } from '../../utils/queries';
import allClassFeatures from '../Features/ClassFeatures';

interface ClassFeature {
  name: string;
  description: string;
  choices?: string[];
  levelRequired?: number;
  selections?: {
    featureName: string;
    selectedOption: string;
  }[];
}

interface ClassFeatures {
  features: ClassFeature[];
  proficiencyChoices?: {
    name: string;
    choose: number;
    options: string[];
  }[];
}

interface ClassFeatureProps {
  characterClass: string;
  characterLevel: number;
  characterId: string;
}

const ClassFeaturesTab: React.FC<ClassFeatureProps> = ({ 
  characterClass, 
  characterLevel,
  characterId 
}) => {
  const [selections, setSelections] = useState<{ [key: string]: string }>({});
  
  // Query to get current character data
  const { data: characterData, loading } = useQuery(GET_CHARACTER, {
    variables: { id: characterId },
    fetchPolicy: 'network-only' // Always fetch fresh data
  });

  // Load existing selections when component mounts or character data changes
  useEffect(() => {
    if (characterData?.character?.classFeatures) {
      const existingSelections: { [key: string]: string } = {};
      characterData.character.classFeatures.forEach((feature: ClassFeature) => {
        if (feature.selections && feature.selections.length > 0) {
          feature.selections.forEach(selection => {
            existingSelections[selection.featureName] = selection.selectedOption;
          });
        }
      });
      console.log('Loaded selections:', existingSelections); // Debug log
      setSelections(existingSelections);
    }
  }, [characterData]);

  const [updateFeatures] = useMutation(UPDATE_CHARACTER_FEATURES, {
    refetchQueries: [
      { 
        query: GET_CHARACTER,
        variables: { id: characterId }
      }
    ]
  });

  const classData: ClassFeatures | undefined = 
    characterClass.toLowerCase() in allClassFeatures
    ? allClassFeatures[characterClass.toLowerCase() as keyof typeof allClassFeatures]
    : undefined;

  const saveSelections = async (newSelections: { [key: string]: string }) => {
    try {
      console.log('Saving selections:', newSelections); // Debug log
      const featureSelections = Object.entries(newSelections).map(([featureName, selectedOption]) => ({
        featureName,
        selectedOption
      }));

      const result = await updateFeatures({
        variables: {
          characterId,
          features: featureSelections
        }
      });
      console.log('Save result:', result); // Debug log
    } catch (error) {
      console.error('Error saving feature selections:', error);
    }
  };

  const handleSelectionChange = (featureName: string, selectedOption: string) => {
    console.log('Selection changed:', { featureName, selectedOption }); // Debug log
    const newSelections = {
      ...selections,
      [featureName]: selectedOption,
    };
    setSelections(newSelections);
    saveSelections(newSelections);
  };

  if (loading) {
    return <Card.Body>Loading features...</Card.Body>;
  }

  if (!classData) {
    return (
      <Card.Body>
        <p className="text-center">No class features available for {characterClass}</p>
      </Card.Body>
    );
  }

  return (
    <Card.Body>
      <Accordion>
        {classData.features
          .filter(feature => !feature.levelRequired || feature.levelRequired <= characterLevel)
          .map((feature, index) => (
          <Accordion.Item key={index} eventKey={index.toString()}>
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 me-3">
                <span>
                  {feature.name}
                  {selections[feature.name] && 
                    <span className="text-success ms-2">
                      ({selections[feature.name]})
                    </span>
                  }
                </span>
                {feature.choices && !selections[feature.name] && 
                  <span className="text-muted">(Choose one)</span>
                }
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <p>{feature.description}</p>
              {feature.choices && (
                <>
                  <h6>Available Options</h6>
                  <ul className="no-bullets">
                    {feature.choices.map((choice, idx) => (
                      <li key={idx}>
                        <label>
                          <input
                            type="radio"
                            name={feature.name}
                            value={choice}
                            checked={selections[feature.name] === choice}
                            onChange={() => handleSelectionChange(feature.name, choice)}
                            style={{ marginRight: "0.5rem" }}
                          />
                          {choice}
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Card.Body>
  );
};

export default ClassFeaturesTab;