import React, { useState } from 'react';
import {
  Accordion,
  Button,
  Modal,
  Container,
  Spinner,
} from 'react-bootstrap';
import { dndApi } from '../../utils/dndApi';

// Interfaces for API responses
interface Rule {
  name: string;
  desc: string;
  index: string;
}

interface RuleDetails extends Rule {
    desc: string;
    subsections?: Array<{
      name: string;
      desc: string;
      index:string;
    }>;
  }

interface AbilityBonus {
  ability_score: {
    name: string;
    index: string;
  };
  bonus: number;
}

interface Trait {
  name: string;
  index: string;
}

interface Race {
  name: string;
  speed: number;
  ability_bonuses: AbilityBonus[];
  traits: Trait[];
  index: string;
}

interface Proficiency {
  name: string;
  index: string;
}

interface StartingEquipment {
  equipment: {
    name: string;
    index: string;
  };
  quantity: number;
}

interface Class {
  name: string;
  hit_die: number;
  proficiencies: Proficiency[];
  starting_equipment: StartingEquipment[];
  index: string;
}

// Interfaces for section props
interface RulesSectionProps {
  rules: Rule[];
}

interface RacesSectionProps {
  races: Race[];
}

interface ClassGuideSectionProps {
  classes: Class[];
}

// Section components
const RulesSection: React.FC<RulesSectionProps> = ({ rules }) => {
    const [expandedRule, setExpandedRule] = useState<string | null>(null);
    const [ruleDetails, setRuleDetails] = useState<Record<string, RuleDetails | undefined>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [subsectionDetails, setSubsectionDetails] = useState<Record<string, string>>({});
    const [loadingSubsection, setLoadingSubsection] = useState<Record<string, boolean>>({});

    // Modified to use getRuleDetails for main rules
    const handleRuleClick = async (ruleIndex: string) => {
        if (!ruleDetails[ruleIndex]) {
            setLoading(prev => ({ ...prev, [ruleIndex]: true }));
            try {
                // Use getRuleDetails for main rules
                const details = await dndApi.getRuleDetails(ruleIndex) as RuleDetails;
                console.log('Fetched rule details:', details);
                setRuleDetails(prev => ({ ...prev, [ruleIndex]: details }));
            } catch (error) {
                console.error('Error fetching rule details:', error);
            } finally {
                setLoading(prev => ({ ...prev, [ruleIndex]: false }));
            }
        }
        setExpandedRule(expandedRule === ruleIndex ? null : ruleIndex);
    };

    // Handle subsection click with specific error handling
    const handleSubsectionClick = async (event: React.MouseEvent, subsectionIndex: string) => {
        event.stopPropagation();
        console.log('Clicking subsection:', subsectionIndex); // Debug log
        
        if (!subsectionDetails[subsectionIndex]) {
            setLoadingSubsection(prev => ({ ...prev, [subsectionIndex]: true }));
            try {
                const details = await dndApi.getRuleSection(subsectionIndex.toLowerCase());
                console.log('Fetched subsection details:', details); // Debug log
                if (details && details.desc) {
                    setSubsectionDetails(prev => ({ ...prev, [subsectionIndex]: details.desc }));
                } else {
                    console.error('No description found in subsection details');
                }
            } catch (error) {
                console.error('Error fetching subsection details:', error);
            } finally {
                setLoadingSubsection(prev => ({ ...prev, [subsectionIndex]: false }));
            }
        }
    };

    const formatDescription = (desc: string) => {
        if (!desc) return '';
        return desc
            // First handle the markdown headers while preserving spacing
            .replace(/([#]{1,20})\s+([^#\n]+)/g, '<h2>$2</h2>')
            // Handle bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle line breaks
            .replace(/\n\n/g, '<br><br>')
            .split('\n')
            .map(line => line.trim())
            .join('<br>');
    };

    return (
        <Accordion>
            {rules.map((rule) => {
                if (!rule) return null;

                return (
                    <Accordion.Item key={rule.index} eventKey={rule.index}>
                        <Accordion.Header onClick={() => handleRuleClick(rule.index)}>
                            {rule.name}
                        </Accordion.Header>
                        <Accordion.Body>
                            {loading[rule.index] ? (
                                <div className="text-center p-3">
                                    <Spinner animation="border" size="sm" />
                                    <p className="mt-2">Loading rule details...</p>
                                </div>
                            ) : ruleDetails[rule.index] ? (
                                <div>
                                    {/* Main rule description */}
                                    <div 
                                        className="rule-description mb-4"
                                        dangerouslySetInnerHTML={{ 
                                            __html: formatDescription(ruleDetails[rule.index]?.desc || '') 
                                        }}
                                    />
                                    
                                    {/* Subsections */}
                                    <Accordion className="mt-3">
                                        {ruleDetails[rule.index]?.subsections?.map((subsection, idx) => (
                                            <Accordion.Item key={idx} eventKey={idx.toString()}>
                                                <Accordion.Header 
                                                    onClick={(e) => handleSubsectionClick(e, subsection.index)}
                                                >
                                                    <span className="subsection-header">
                                                        {subsection.name}
                                                    </span>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    {loadingSubsection[subsection.index] ? (
                                                        <Spinner animation="border" size="sm" />
                                                    ) : (
                                                        <div 
                                                            className="subsection-content"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: formatDescription(
                                                                    subsectionDetails[subsection.index] || ''
                                                                ) 
                                                            }}
                                                        />
                                                    )}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                </div>
                            ) : (
                                <p>Click to load rule details</p>
                            )}
                        </Accordion.Body>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
};

const RacesSection: React.FC<RacesSectionProps> = ({ races }) => (
  <Accordion>
    {races.map((race, index) => (
      <Accordion.Item key={index} eventKey={index.toString()}>
        <Accordion.Header>{race.name}</Accordion.Header>
        <Accordion.Body>
          <h5>Speed: {race.speed}</h5>
          <h5>Ability Bonuses:</h5>
          <ul>
            {race.ability_bonuses?.map((bonus, idx) => (
              <li key={idx}>
                {bonus.ability_score.name}: +{bonus.bonus}
              </li>
            ))}
          </ul>
          <h5>Traits:</h5>
          <ul>
            {race.traits?.map((trait, idx) => (
              <li key={idx}>{trait.name}</li>
            ))}
          </ul>
        </Accordion.Body>
      </Accordion.Item>
    ))}
  </Accordion>
);

const ClassGuideSection: React.FC<ClassGuideSectionProps> = ({ classes }) => (
  <Accordion>
    {classes.map((classItem, index) => (
      <Accordion.Item key={index} eventKey={index.toString()}>
        <Accordion.Header>{classItem.name}</Accordion.Header>
        <Accordion.Body>
          <h5>Hit Die: d{classItem.hit_die}</h5>
          <h5>Proficiencies:</h5>
          <ul>
            {classItem.proficiencies?.map((prof, idx) => (
              <li key={idx}>{prof.name}</li>
            ))}
          </ul>
          <h5>Starting Equipment:</h5>
          <ul>
            {classItem.starting_equipment?.map((equipment, idx) => (
              <li key={idx}>
                {equipment.equipment?.name} x{equipment.quantity}
              </li>
            ))}
          </ul>
        </Accordion.Body>
      </Accordion.Item>
    ))}
  </Accordion>
);

// Basic API response structure
interface ApiListResponse {
  count: number;
  results: Array<{
    index: string;
    name: string;
    url: string;
  }>;
}

// Specific response types for each section
interface RulesResponse {
  count: number;
  results: Array<Rule>;
}

interface RacesResponse extends ApiListResponse {
  results: Array<{
    index: string;
    name: string;
    url: string;
  }>;
}

interface ClassesResponse extends ApiListResponse {
  results: Array<{
    index: string;
    name: string;
    url: string;
  }>;
}

// Type for active section
type SectionType = 'rules' | 'races' | 'classes';

const PlayerHandbook: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('rules');
  const [sectionData, setSectionData] = useState<Rule[] | Race[] | Class[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSectionClick = async (section: SectionType) => {
    setActiveSection(section);
    setShowModal(true);
    setLoading(true);

    try {
      switch (section) {
        case 'rules': {
          const rulesResponse = await dndApi.getRules() as RulesResponse;
          setSectionData(rulesResponse.results);
          break;
        }
        case 'races': {
          const racesResponse = await dndApi.getRaces() as RacesResponse;
          const detailedRaces = await Promise.all(
            racesResponse.results.map(async (race) => {
              const raceDetails = await dndApi.getRace(race.index);
              return raceDetails as Race;
            })
          );
          setSectionData(detailedRaces);
          break;
        }
        case 'classes': {
          const classesResponse = await dndApi.getClasses() as ClassesResponse;
          const detailedClasses = await Promise.all(
            classesResponse.results.map(async (cls) => {
              const classDetails = await dndApi.getClass(cls.index);
              return classDetails as Class;
            })
          );
          setSectionData(detailedClasses);
          break;
        }
        default:
          setSectionData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSectionData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading content...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'rules':
        return <RulesSection rules={sectionData as Rule[]} />;
      case 'races':
        return <RacesSection races={sectionData as Race[]} />;
      case 'classes':
        return <ClassGuideSection classes={sectionData as Class[]} />;
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'rules':
        return 'Game Rules';
      case 'races':
        return 'Character Races';
      case 'classes':
        return 'Character Classes';
      default:
        return '';
    }
  };

  return (
    <div className="player-handbook">
      <div className="handbook-menu">
        <h4 className="menu-title">Player Handbook</h4>
        <div className="menu-items">
          <Button 
            variant="dark" 
            className="menu-item"
            onClick={() => handleSectionClick('rules')}
          >
            Rules & Mechanics
          </Button>
          <Button 
            variant="dark" 
            className="menu-item"
            onClick={() => handleSectionClick('races')}
          >
            Races
          </Button>
          <Button 
            variant="dark" 
            className="menu-item"
            onClick={() => handleSectionClick('classes')}
          >
            Class Guide
          </Button>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{getSectionTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            {renderModalContent()}
          </Container>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PlayerHandbook;