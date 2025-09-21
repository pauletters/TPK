// CharacterDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Nav, Form} from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHARACTER } from '../utils/queries';
import { 
  UPDATE_CHARACTER_SPELLS, 
  TOGGLE_SPELL_PREPARED, 
  UPDATE_CHARACTER_EQUIPMENT,
  UPDATE_CHARACTER
} from '../utils/mutations';
import { dndApi } from '../utils/dndApi';
import { CharacterData, ApiSpell } from './types';
import SpellCard from './Spells/SpellCard';
import SpellModal from './Spells/SpellSelection';
import EquipmentModal from './Equipment/EquipmentSelection';
import BackgroundTab from './Backgrounds/BackgroundTab';
import ClassFeaturesTab from './Features/ClassFeaturesTab';
import CombinedFeatures from './Features/CombinedFeatures';
import { Equipment } from './Equipment/EquipmentSelection';
interface CharacterParams {
  characterId: string;
}



const CharacterDetails: React.FC = () => {
  const { characterId } = useParams<keyof CharacterParams>() as CharacterParams;
  const navigate = useNavigate();
  type TabKey = 'details' | 'spells' | 'equipment' | 'background' | 'classFeatures';
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const { loading: isLoading, error, data } = useQuery<{ character: CharacterData }>(GET_CHARACTER, {
    variables: { id: characterId },
  });
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [updatedCharacter, setUpdatedCharacter] = useState<CharacterData | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(true); // Track private/public state
  const [spellDetails, setSpellDetails] = useState<Record<string, ApiSpell>>({}); // Cache spell details
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [updateCharacterSpells] = useMutation(UPDATE_CHARACTER_SPELLS);
  const [toggleSpellPrepared] = useMutation(TOGGLE_SPELL_PREPARED);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [updateCharacterEquipment] = useMutation(UPDATE_CHARACTER_EQUIPMENT);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [updateCharacter] = useMutation(UPDATE_CHARACTER); // Mutation to update character
  
  useEffect(() => {
    if (data?.character) {
      const dexModifier = Math.floor((data.character.attributes.dexterity - 10) / 2);
      setUpdatedCharacter({
        ...data.character,
        combat: {
          ...data.character.combat,
          initiative: data.character.combat.initiative || dexModifier  // Use existing initiative or dex mod
        }
      });
      setIsPrivate(data.character.private);
    }
  }, [data]);
  
  useEffect(() => {
    const loadSpellDetails = async () => {
      if (data?.character?.spells) {
        const spellsToLoad = data.character.spells.filter(
          spell => !spellDetails[spell.name]
        );
  
        // Load all spells in parallel
        const spellPromises = spellsToLoad.map(async (spell) => {
          try {
            const spellIndex = spell.name.toLowerCase().replace(/\s+/g, '-');
            const fetchedSpell = await dndApi.getSpell(spellIndex);
            return { name: spell.name, details: fetchedSpell };
          } catch (error) {
            console.error(`Error loading spell ${spell.name}:`, error);
            return null;
          }
        });
  
        const loadedSpells = await Promise.all(spellPromises);
        
        // Add all successfully loaded spells to the state
        const newSpellDetails = { ...spellDetails };
        loadedSpells.forEach(spell => {
          if (spell && spell.details) {
            newSpellDetails[spell.name] = spell.details;
          }
        });
        
        setSpellDetails(newSpellDetails);
      }
    };

    loadSpellDetails();
  }, [data?.character?.spells]);

  const handleTogglePrivate = () => {
    setIsPrivate(prev => {
      const newPrivateValue = !prev; // Toggle the value
      return newPrivateValue; // Set the updated value
    });
  };
  

  const handleAddSpells = async (newSpellList: { name: string; level: number; prepared: boolean; }[]) => {
    if (!data?.character) {
      console.error('No character data available');
      return;
    }
    
    try {
      // Ensure all required fields are present and properly formatted
      const cleanSpells = newSpellList.map(spell => {
        if (!spell.name || typeof spell.level !== 'number') {
          throw new Error('Invalid spell data');
        }
        return {
          name: spell.name.trim(),
          level: spell.level,
          prepared: Boolean(spell.prepared)
        };
      });

      console.log('Sending spell update:', {
        characterId,
        spells: cleanSpells
      });
  
      const { data: updateData } = await updateCharacterSpells({
        variables: {
          id: characterId,
          spells: cleanSpells
        },
        refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }],
        errorPolicy: 'all'
      });

      if (!updateData?.updateCharacterSpells) {
        console.error('No data returned from updateCharacterSpells mutation');
        throw new Error('Failed to update character spells');
      }

      console.log('Spells updated successfully:', updateData.updateCharacterSpells);

    } catch (error) {
      console.error('Error updating spells:', error);
      alert('Failed to update spells. Please try again.');
    }
  };

  const handleRemoveSpell = async (spellName: string) => {
    if (!data?.character?.spells) return;
    
    

    try {
      const updatedSpells = data.character.spells.filter(spell => spell.name !== spellName)
      .map(spell => ({
        name: spell.name,
        level: spell.level,
        prepared: spell.prepared
      })
      );
    
      await updateCharacterSpells({
        variables: {
          id: characterId,
          spells: updatedSpells
        },
        refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }]
      });
    } catch (error) {
      console.error('Error removing spell:', error);
    }
  };

  const handleToggleSpellPrepared = async (spellName: string) => {
    if (!data?.character) return;
    
    console.log('Attempting to toggle spell:', spellName);
    try {
      const { data: mutationData } = await toggleSpellPrepared({
        variables: {
          id: characterId,
          spellName
        },
        refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }],
        onCompleted: (data) => {
          console.log('Mutation completed:', data);
        },
        onError: (error) => {
          console.error('Mutation error:', error);
        }
      });
      
          // Check if we got valid data back
    if (!mutationData?.toggleSpellPrepared) {
      throw new Error('No data returned from toggleSpellPrepared mutation');
    }

    // Log the result
    console.log('Toggle spell successful:', mutationData.toggleSpellPrepared);
  } catch (error) {
    console.error('Error toggling spell prepared status:', error);
    // Optionally show error to user
    alert('Failed to toggle spell prepared status. Please try again.');
  }
};

  // Utility function to clean data (remove __typename fields)
const cleanInputData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(cleanInputData);
  }
  if (data && typeof data === 'object') {
    const { __typename, ...cleanedData } = data;
    // Recursively clean nested objects
    return Object.keys(cleanedData).reduce((acc: Record<string, any>, key) => {
      acc[key] = cleanInputData(cleanedData[key]);
      return acc;
    }, {});
  }
  return data;
};

// Handler for adding equipment
const handleAddEquipment = async (newEquipment: Equipment[]) => {
  if (!data?.character) return;

  try {
    // Clean the new equipment data
    const cleanNewEquipment = newEquipment.map(item => ({
      name: item.name,
      category: item.equipment_category?.name, // Use category name
      cost: item.cost ? {
        quantity: item.cost.quantity,
        unit: item.cost.unit
      } : undefined,
      weight: item.weight || null,
      description: item.desc || [], // Use desc if available
      properties: item.properties || []
    }));

    // Clean the existing equipment data
    const cleanExistingEquipment = data.character.equipment.map(item => ({
      name: item.name,
      category: item.category,
      cost: item.cost ? {
        quantity: item.cost.quantity,
        unit: item.cost.unit
      } : undefined,
      weight: item.weight || null,
      description: item.description || [],
      properties: item.properties || []
    }));

    // Combine the new and existing equipment
    const combinedEquipment = [...cleanExistingEquipment, ...cleanNewEquipment];

    // Call the update character mutation
    await updateCharacterEquipment({
      variables: {
        id: characterId,
        equipment: combinedEquipment
      },
      refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }] // Refetch the character data to get the updated list of equipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
  }
};


// Handler for removing equipment
const handleRemoveEquipment = async (equipmentName: string) => {
  if (!data?.character) return;

  try {
    // Filter out the equipment item to remove by its name
    const updatedEquipment = data.character.equipment
      .filter(item => item.name !== equipmentName) // Remove the item
      .map(item => ({
        name: item.name,
        category: item.category,
        cost: item.cost ? {
          quantity: item.cost.quantity,
          unit: item.cost.unit
        } : undefined,
        weight: item.weight || null,
        description: item.description || [],
        properties: item.properties || []
      }));

    if (updatedEquipment.length === data.character.equipment.length) {
      console.log('No equipment removed.');
      return; // Exit early if no equipment was actually removed
    }

    // Call the mutation to update the character's equipment
    await updateCharacterEquipment({
      variables: {
        id: characterId,
        equipment: updatedEquipment
      },
      refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }]
    });

    console.log('Equipment removed successfully');
  } catch (error) {
    console.error('Error removing equipment:', error);
  }
};

  
  

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getProficiencyBonus = (level: number): number => {
    const proficiencyBonus = Math.ceil(level / 4) + 1;
    return proficiencyBonus;
  };  

  const handleInputChange = (field: string, value: string | number) => {
    if (updatedCharacter) {
      // Ensure that each nested field exists before updating
      setUpdatedCharacter(prevState => {
        if (!prevState) return prevState; // Handle case if prevState is null
  
        // Spread the previous state and update only the modified field
        return {
          ...prevState,
          basicInfo: {
            ...prevState.basicInfo,
            [field]: value,
          },
          attributes: {
            ...prevState.attributes,
            [field]: value,
          },
          combat: {
            ...prevState.combat,
            [field]: value,
          },
          skills: {
            ...prevState.skills,
            [field]: value,
          },
        };
      });
    }
  };
  
  
  const handleSubmitChanges = async () => {
    try {
      if (updatedCharacter) {
        // Make sure the updatedCharacter has all required fields before submission
        const cleanedCharacter = {
          id: updatedCharacter._id, // Ensure that the ID is included
          basicInfo: {
            name: updatedCharacter.basicInfo?.name ?? '',
            class: updatedCharacter.basicInfo?.class ?? '',
            race: updatedCharacter.basicInfo?.race ?? '',
            level: updatedCharacter.basicInfo?.level ?? 1,
            background: updatedCharacter.basicInfo?.background ?? '',
            alignment: updatedCharacter.basicInfo?.alignment ?? '',
            avatar: updatedCharacter.basicInfo?.avatar ?? '',
          },
          attributes: {
            strength: updatedCharacter.attributes?.strength ?? 10,
            dexterity: updatedCharacter.attributes?.dexterity ?? 10,
            constitution: updatedCharacter.attributes?.constitution ?? 10,
            intelligence: updatedCharacter.attributes?.intelligence ?? 10,
            wisdom: updatedCharacter.attributes?.wisdom ?? 10,
            charisma: updatedCharacter.attributes?.charisma ?? 10,
          },
          combat: {
            armorClass: updatedCharacter.combat?.armorClass ?? 10,
            initiative: updatedCharacter.combat?.initiative ?? 0,
            speed: updatedCharacter.combat?.speed ?? 30,
            hitPoints: updatedCharacter.combat?.hitPoints ?? 10,
          },
          skills: {
            proficiencies: updatedCharacter.skills?.proficiencies ?? [],
            savingThrows: updatedCharacter.skills?.savingThrows ?? [],
          },
          equipment: updatedCharacter.equipment ?? [],
          spells: updatedCharacter.spells ?? [],
          private: isPrivate,
          // Remove any unnecessary or incorrect fields here
        };
  
        // Log the cleaned character for debugging
        console.log('Submitting cleaned character:', cleanedCharacter);
  
        // Submit the cleaned character data to the server
        await updateCharacter({
          variables: { input: cleanedCharacter },
          refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }],
        });
  
        setIsEditing(false); // Exit edit mode after saving
      } else {
        console.error('No character data available for update');
      }
    } catch (error) {
      console.error('Error submitting changes:', error);
      alert('Failed to submit changes. Please try again.');
    }
  };
  
  
  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h2>Loading character...</h2>
        </div>
      </Container>
    );
  }
  
  if (error || !data?.character) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h2>Character not found</h2>
          <Button variant="primary" onClick={() => navigate('/my-characters')}>
            Back to Characters
          </Button>
        </div>
      </Container>
    );
  }
  

  const character = data.character;

  const proficiencyBonus = getProficiencyBonus(character.basicInfo.level);

  const attributeMods = {
    strengthMod: Number(getModifier(character.attributes.strength)),
    dexterityMod: Number(getModifier(character.attributes.dexterity)),
    constitutionMod: Number(getModifier(character.attributes.constitution)),
    intelligenceMod: Number(getModifier(character.attributes.intelligence)),
    wisdomMod: Number(getModifier(character.attributes.wisdom)),
    charismaMod: Number(getModifier(character.attributes.charisma)),
  }

  const skillMods = {
    acrobaticsMod: attributeMods.dexterityMod + (
      character.skills.proficiencies.includes('Acrobatics') ? proficiencyBonus : 0
    ),
    animalHandlingMod: attributeMods.wisdomMod + (
      character.skills.proficiencies.includes('Animal Handling') ? proficiencyBonus : 0
    ),
    arcanaMod: attributeMods.intelligenceMod + (
      character.skills.proficiencies.includes('Arcana') ? proficiencyBonus : 0
    ),
    athleticsMod: attributeMods.strengthMod + (
      character.skills.proficiencies.includes('Athletics') ? proficiencyBonus : 0
    ),
    deceptionMod: attributeMods.charismaMod + (
      character.skills.proficiencies.includes('Deception') ? proficiencyBonus : 0
    ),
    historyMod: attributeMods.intelligenceMod + (
      character.skills.proficiencies.includes('History') ? proficiencyBonus : 0
    ),
    insightMod: attributeMods.wisdomMod + (
      character.skills.proficiencies.includes('Insight') ? proficiencyBonus : 0
    ),
    intimidationMod: attributeMods.charismaMod + (
      character.skills.proficiencies.includes('Intimidation') ? proficiencyBonus : 0
    ),
    investigationMod: attributeMods.intelligenceMod + (
      character.skills.proficiencies.includes('Investigation') ? proficiencyBonus : 0
    ),
    medicineMod: attributeMods.wisdomMod + (
      character.skills.proficiencies.includes('Medicine') ? proficiencyBonus : 0
    ),
    natureMod: attributeMods.intelligenceMod + (
      character.skills.proficiencies.includes('Nature') ? proficiencyBonus : 0
    ),
    perceptionMod: attributeMods.wisdomMod + (
      character.skills.proficiencies.includes('Perception') ? proficiencyBonus : 0
    ),
    performanceMod: attributeMods.charismaMod + (
      character.skills.proficiencies.includes('Performance') ? proficiencyBonus : 0
    ),
    persuasionMod: attributeMods.charismaMod + (
      character.skills.proficiencies.includes('Persuasion') ? proficiencyBonus : 0
    ),
    religionMod: attributeMods.intelligenceMod + (
      character.skills.proficiencies.includes('Religion') ? proficiencyBonus : 0
    ),
    sleightOfHandMod: attributeMods.dexterityMod + (
      character.skills.proficiencies.includes('Sleight of Hand') ? proficiencyBonus : 0
    ),
    stealthMod: attributeMods.dexterityMod + (
      character.skills.proficiencies.includes('Stealth') ? proficiencyBonus : 0
    ),
    survivalMod: attributeMods.wisdomMod + (
      character.skills.proficiencies.includes('Survival') ? proficiencyBonus : 0
    ),
  }

  return (
    <Container className="py-4">
      <Button id='back-to-characters-button-top' variant="outline-secondary" onClick={() => navigate('/my-characters')} style={{ backgroundColor: '#0d6efd', color: 'white' }}>
        Back to Characters
      </Button>
      <div id='character-name-container' className="d-flex justify-content-between align-items-center mb-4">
           {/* Avatar Image */}
           <div className="me-3">
          {character.basicInfo.avatar && (
            <img
              src={character.basicInfo.avatar}
              alt={`${character.basicInfo.name}'s Avatar`}
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          )}
        </div>
        <h1>{character.basicInfo.name}</h1>
        <Button id='back-to-characters-button-side' variant="outline-secondary" onClick={() => navigate('/my-characters')} style={{ backgroundColor: '#0d6efd', color: 'white' }}>
          Back to Characters
        </Button>
      </div>

      <div id='character-tabs-top' className="character-tabs">
          <Nav variant="pills" className="character-tabs-buttons">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              >
                Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'spells'}
                onClick={() => setActiveTab('spells')}
              >
                Spells
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'equipment'}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'background'}
                onClick={() => setActiveTab('background')}
              >
                Background
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'classFeatures'}
                onClick={() => setActiveTab('classFeatures')}
              >
                Class Features
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'details' && (
            <div className="edit-button">
              {/* Only show Edit button when not editing */}
              {isEditing ? (
                <Button variant="success" onClick={handleSubmitChanges}>Submit Changes</Button>
              ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Character</Button>
              )}
            </div>
          )}

          {/* Show Private/Public toggle only when editing */}
          {isEditing && activeTab === 'details' && (
            <div className="privacy-toggle">
              <h4>Privacy Setting</h4>
              <p>Set the ability for your character to be viewed by others</p>
              <Form.Check
                type="switch"
                id="private-toggle"
                label={isPrivate ? 'Private' : 'Public'}
                checked={isPrivate}
                onChange={handleTogglePrivate}
              />
            </div>
          )}
        </div>


      <div className="character-sheet-container">
        <div className="content-container">
          {activeTab === 'details' && (
            <Row className="g-4">
              <Col md={4}>
                <Card>
                  <Card.Header>Basic Information</Card.Header>
                  <Card.Body className='character-detail-container'>
                  <p className='character-detail basic-info'><strong>Class:</strong> {character.basicInfo.class.charAt(0).toUpperCase() + character.basicInfo.class.slice(1)}</p>
                    {isEditing ? (
                      <div id='basic-info-level-input' className="character-detail basic-info d-flex align-items-center">
                        <strong className='character-detail basic-info'>Level:</strong>
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.basicInfo.level || ''}
                          onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                        />
                      </div>
                    ) : (
                      <p className='character-detail basic-info'><strong>Level:</strong> {character.basicInfo.level}</p>
                    )}
                    <p className='character-detail basic-info'><strong>Race:</strong> {character.basicInfo.race.charAt(0).toUpperCase() + character.basicInfo.race.slice(1)}</p>
                    <p className='character-detail basic-info'><strong>Background:</strong> {character.basicInfo.background.charAt(0).toUpperCase() + character.basicInfo.background.slice(1)}</p>
                    <p className='character-detail basic-info'><strong>Alignment:</strong> {character.basicInfo.alignment.charAt(0).toUpperCase() + character.basicInfo.alignment.slice(1)}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card>
                  <Card.Header>Combat Stats</Card.Header>
                  <Card.Body className='character-detail-container'>
                    {isEditing ? (
                      <div>
                        <div className="character-detail d-flex align-items-center mb-2">
                          <strong>Armor Class:</strong>
                          <input
                            type="number"
                            className="form-control form-control-sm ms-2 w-25"
                            value={updatedCharacter?.combat.armorClass || ''}
                            onChange={(e) => handleInputChange('armorClass', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="character-detail d-flex align-items-center mb-2">
                        <strong>Initiative:</strong>
                          <input
                            type="number"
                            className="form-control form-control-sm ms-2 w-25"
                            value={Math.floor(((updatedCharacter?.attributes.dexterity ?? 10) - 10) / 2)}
                            onChange={(e) => handleInputChange('initiative', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="character-detail d-flex align-items-center mb-2">
                          <strong>Speed:</strong>
                          <input
                            type="number"
                            className="form-control form-control-sm ms-2 w-25"
                            value={updatedCharacter?.combat.speed || ''}
                            onChange={(e) => handleInputChange('speed', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="character-detail d-flex align-items-center mb-2">
                          <strong>Hit Points:</strong>
                          <input
                            type="number"
                            className="form-control form-control-sm ms-2 w-25"
                            value={updatedCharacter?.combat.hitPoints || ''}
                            onChange={(e) => handleInputChange('hitPoints', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className='character-detail'><strong>Armor Class:</strong> {character.combat.armorClass}</p>
                        <p className='character-detail'><strong>Initiative:</strong> {character.attributes ? Math.floor((character.attributes.dexterity - 10) / 2) >= 0 ? 
                            `+${Math.floor((character.attributes.dexterity - 10) / 2)}` : 
                            Math.floor((character.attributes.dexterity - 10) / 2) : ''}</p>
                        <p className='character-detail'><strong>Speed:</strong> {character.combat.speed} ft.</p>
                        <p className='character-detail'><strong>Hit Points:</strong> {character.combat.hitPoints}/{character.combat.hitPoints}</p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card>
                  <Card.Header>Attributes</Card.Header>
                  <Card.Body className='character-detail-container'>
                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Strength:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.strength || ''}
                          onChange={(e) => handleInputChange('strength', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.strength} ({getModifier(character.attributes.strength)})</span>
                      )}
                    </div>

                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Dexterity:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.dexterity || ''}
                          onChange={(e) => handleInputChange('dexterity', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.dexterity} ({getModifier(character.attributes.dexterity)})</span>
                      )}
                    </div>

                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Constitution:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.constitution || ''}
                          onChange={(e) => handleInputChange('constitution', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.constitution} ({getModifier(character.attributes.constitution)})</span>
                      )}
                    </div>

                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Intelligence:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.intelligence || ''}
                          onChange={(e) => handleInputChange('intelligence', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.intelligence} ({getModifier(character.attributes.intelligence)})</span>
                      )}
                    </div>

                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Wisdom:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.wisdom || ''}
                          onChange={(e) => handleInputChange('wisdom', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.wisdom} ({getModifier(character.attributes.wisdom)})</span>
                      )}
                    </div>

                    <div className=" character-detail d-flex align-items-center mb-2">
                      <strong>Charisma:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm ms-2 w-25"
                          value={updatedCharacter?.attributes.charisma || ''}
                          onChange={(e) => handleInputChange('charisma', parseInt(e.target.value))}
                        />
                      ) : (
                        <span>{character.attributes.charisma} ({getModifier(character.attributes.charisma)})</span>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>



              <Col md={6}>
                <Card>
                  <Card.Header>Skills</Card.Header>
                  <Card.Body>
                  <p>
                  ★ = Proficient
                  </p>
                    <Row id='skill-list'>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Acrobatics (Dex):</strong> {skillMods.acrobaticsMod >= 0 ? `+${skillMods.acrobaticsMod}` : skillMods.acrobaticsMod} {character.skills.proficiencies.includes("Acrobatics") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Animal Handling (Wis):</strong> {skillMods.animalHandlingMod >= 0 ? `+${skillMods.animalHandlingMod}` : skillMods.animalHandlingMod} {character.skills.proficiencies.includes("Animal Handling") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Arcana (Int):</strong> {skillMods.arcanaMod >= 0 ? `+${skillMods.arcanaMod}` : skillMods.arcanaMod} {character.skills.proficiencies.includes("Arcana") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Athletics (Str):</strong> {skillMods.athleticsMod >= 0 ? `+${skillMods.athleticsMod}` : skillMods.athleticsMod} {character.skills.proficiencies.includes("Athletics") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Deception (Cha):</strong> {skillMods.deceptionMod >= 0 ? `+${skillMods.deceptionMod}` : skillMods.deceptionMod} {character.skills.proficiencies.includes("Deception") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>History (Int):</strong> {skillMods.historyMod >= 0 ? `+${skillMods.historyMod}` : skillMods.historyMod} {character.skills.proficiencies.includes("History") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Insight (Wis):</strong> {skillMods.insightMod >= 0 ? `+${skillMods.insightMod}` : skillMods.insightMod} {character.skills.proficiencies.includes("Insight") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Intimidation (Cha):</strong> {skillMods.intimidationMod >= 0 ? `+${skillMods.intimidationMod}` : skillMods.intimidationMod} {character.skills.proficiencies.includes("Intimidation") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Investigation (Int):</strong> {skillMods.investigationMod >= 0 ? `+${skillMods.investigationMod}` : skillMods.investigationMod} {character.skills.proficiencies.includes("Investigation") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Medicine (Wis):</strong> {skillMods.medicineMod >= 0 ? `+${skillMods.medicineMod}` : skillMods.medicineMod} {character.skills.proficiencies.includes("Medicine") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Nature (Int):</strong> {skillMods.natureMod >= 0 ? `+${skillMods.natureMod}` : skillMods.natureMod} {character.skills.proficiencies.includes("Nature") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Perception (Wis):</strong> {skillMods.perceptionMod >= 0 ? `+${skillMods.perceptionMod}` : skillMods.perceptionMod} {character.skills.proficiencies.includes("Perception") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Performance (Cha):</strong> {skillMods.performanceMod >= 0 ? `+${skillMods.performanceMod}` : skillMods.performanceMod} {character.skills.proficiencies.includes("Performance") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Persuasion (Cha):</strong> {skillMods.persuasionMod >= 0 ? `+${skillMods.persuasionMod}` : skillMods.persuasionMod} {character.skills.proficiencies.includes("Persuasion") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Religion (Int):</strong> {skillMods.religionMod >= 0 ? `+${skillMods.religionMod}` : skillMods.religionMod} {character.skills.proficiencies.includes("Religion") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Sleight of Hand (Dex):</strong> {skillMods.sleightOfHandMod >= 0 ? `+${skillMods.sleightOfHandMod}` : skillMods.sleightOfHandMod} {character.skills.proficiencies.includes("Sleight of Hand") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Stealth (Dex):</strong> {skillMods.stealthMod >= 0 ? `+${skillMods.stealthMod}` : skillMods.stealthMod} {character.skills.proficiencies.includes("Stealth") && "★"}
                        </p>
                      </Col>
                      <Col xs={6} className='skill'>
                        <p>
                          <strong>Survival (Wis):</strong> {skillMods.survivalMod >= 0 ? `+${skillMods.survivalMod}` : skillMods.survivalMod} {character.skills.proficiencies.includes("Survival") && "★"}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
              <Card>
                <Card.Header>Features & Traits</Card.Header>
                <Card.Body>
                  <CombinedFeatures
                    characterClass={character.basicInfo.class}
                    characterLevel={character.basicInfo.level}
                    classFeatures={character.classFeatures.map(feature => ({
                      ...feature,
                      levelRequired: feature.levelRequired ?? 0 // Ensure levelRequired is a number
                    }))}
                  />
                </Card.Body>
              </Card>
              </Col>
            </Row>
          )}

          {activeTab === 'spells' && (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Spells</span>
                  <Button variant="primary" size="sm" onClick={() => setShowSpellModal(true)}>
                    Add Spell
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
              {data?.character?.spells && data.character.spells.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {data.character.spells.map((spell) => (
                    <Col key={spell.name}>
                      <SpellCard
                        name={spell.name}
                        level={spell.level}
                        prepared={spell.prepared}
                        description={spellDetails[spell.name]?.desc?.[0] || ''}
                        school={spellDetails[spell.name]?.school?.name || ''}
                        fullSpellDetails={spellDetails[spell.name] ? {
                          range: spellDetails[spell.name].range,
                          castingTime: spellDetails[spell.name].casting_time,
                          duration: spellDetails[spell.name].duration,
                          components: spellDetails[spell.name].components,
                          classes: spellDetails[spell.name].classes?.map((c: { name: string }) => c.name)
                        } : undefined}
                        onRemove={() => handleRemoveSpell(spell.name)}
                        onTogglePrepared={() => handleToggleSpellPrepared(spell.name)}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p className="text-center">No spells added yet.</p>
                )}
              </Card.Body>
            </Card>
          )}

          {activeTab === 'equipment' && (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Equipment</span>
                  <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowEquipmentModal(true)}
                  >
                    Add Equipment
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="equipment-list">
              {character.equipment && character.equipment.length > 0 ? (
                  <div className="list-group list-group-flush">
                  {character.equipment.map((item) => (
                    <div 
                      key={item.name} 
                      className="list-group-item"
                      style={{ 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        backgroundColor: expandedItems.has(item.name) ? '#f8f9fa' : 'inherit'
                      }}
                      onClick={() => {
                        setExpandedItems(prev => {
                          const newExpanded = new Set(prev);
                          if (newExpanded.has(item.name)) {
                            newExpanded.delete(item.name);
                          } else {
                            newExpanded.add(item.name);
                          }
                          return newExpanded;
                        });
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.backgroundColor = expandedItems.has(item.name) ? '#f8f9fa' : 'inherit';
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto" style={{ flex: 1 }}>
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-bold">{item.name}</div>
                              <div className="text-muted small">{item.category}</div>
                            </div>
                            <div className="text-end">
                              {item.cost && (
                                <div className="small">{item.cost.quantity} {item.cost.unit}</div>
                              )}
                              {item.weight && (
                                <div className="text-muted small">{item.weight} lb</div>
                              )}
                            </div>
                          </div>
                          {expandedItems.has(item.name) && (
                            <>
                              {item.description && item.description.length > 0 && (
                                <div className="small text-muted mt-1">
                                  {item.description[0]}
                                </div>
                              )}
                              {item.properties && item.properties.length > 0 && (
                                <div className="small mt-1">
                                  <strong>Properties:</strong> {item.properties.join(', ')}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <Button 
                          variant="outline-danger"
                          size="sm"
                          className="ms-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEquipment(item.name);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center my-4">No equipment added yet.</p>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
        
        {activeTab === 'background' && (
            <Card>
              <Card.Header className="bg-danger text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Background</span>
                </div>
              </Card.Header>
              <Card.Body>
                <BackgroundTab 
                    character={character}
                    characterBackground={character.basicInfo.background}
                    onBackstoryChange={(newBackstory) => {
                    // Handle backstory update here with your mutation
                    console.log('Backstory updated:', newBackstory);
                }}
                    onInputChange={(field, value) => {
                    // Handle input change here
                    console.log(`Field ${field} changed to ${value}`);
                }}
              />
            </Card.Body>
          </Card>
          )}
          {activeTab === 'classFeatures' && (
            <Card>
              <Card.Header>Class Features</Card.Header>
              <ClassFeaturesTab 
                characterClass={character.basicInfo.class}
                characterLevel={character.basicInfo.level}
                characterId={characterId}
              />
            </Card>
          )}
        </div>

        <div id='character-tabs-side' className="character-tabs">
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              >
                Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'spells'}
                onClick={() => setActiveTab('spells')}
              >
                Spells
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'equipment'}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'background'}
                onClick={() => setActiveTab('background')}
              >
                Background
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'classFeatures'}
                onClick={() => setActiveTab('classFeatures')}
              >
                Class Features
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'details' && (
            <div className="edit-button">
              {/* Only show Edit button when not editing */}
              {isEditing ? (
                <Button variant="success" onClick={handleSubmitChanges}>Submit Changes</Button>
              ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Character</Button>
              )}
            </div>
          )}

          {/* Show Private/Public toggle only when editing */}
          {isEditing && activeTab === 'details' && (
            <div className="privacy-toggle">
              <h4>Privacy Setting</h4>
              <p>Set the ability for your character to be viewed by others</p>
              <Form.Check
                type="switch"
                id="private-toggle"
                label={isPrivate ? 'Private' : 'Public'}
                checked={isPrivate}
                onChange={handleTogglePrivate}
              />
            </div>
          )}
</div>
</div>

      {character && (
    <SpellModal
      show={showSpellModal}
      onClose={() => setShowSpellModal(false)}
      onAddSpells={handleAddSpells}
      characterClass={character.basicInfo.class}
      existingSpells={data.character.spells || []}
    />
  )}

{character && (
  <>
    <EquipmentModal
      show={showEquipmentModal}
      onClose={() => setShowEquipmentModal(false)}
      onAddEquipment={(equipment: Equipment[]) => handleAddEquipment(equipment)}
    />
  </>
)}
    </Container>
  );
};

export default CharacterDetails;