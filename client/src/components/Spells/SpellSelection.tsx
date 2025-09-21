import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Card, Row, Col } from 'react-bootstrap';
import { dndApi } from '../../utils/dndApi';

interface SpellApiResponse {
  count: number;
  results: {
    index: string;
    name: string;
    url: string;
  }[];
}

interface Spell {
  index: string;
  name: string;
  level: number;
  school: {
    name: string;
    };
  classes: {
      name: string;
    }[];
    desc: string[];
  };

interface SpellModalProps {
  show: boolean;
  onClose: () => void;
  onAddSpells: (spells: { name: string; level: number; prepared: boolean; }[]) => void;
  characterClass?: string;
  existingSpells: { name: string; level: number; prepared: boolean; }[];
}

const SpellModal: React.FC<SpellModalProps> = ({ 
  show, 
  onClose, 
  onAddSpells, 
  characterClass,
  existingSpells 
}) => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSpells = async () => {
      if (!show || !characterClass) return;
      
      try {
        setLoading(true);
        
        const classResponse = await dndApi.getSpellsByClass(characterClass) as SpellApiResponse;
    
    if (classResponse?.results) {
      
      // Fetch details for all spells in parallel
      const spellPromises = classResponse.results.map(async (spell) => {
        try {
          const spellIndex = spell.name.toLowerCase()
          .replace(/[']/g, '') // Remove apostrophes
          .replace(/[/]/g, '-') // Replace forward slashes with hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/[()]/g, '') // Remove parentheses
          .trim();
          const fetchedSpell = await dndApi.getSpell(spellIndex) as Spell;
          
          if (fetchedSpell) {
            return {
              index: fetchedSpell.index,
              name: fetchedSpell.name,
              level: fetchedSpell.level,
              school: { name: fetchedSpell.school.name },
              classes: fetchedSpell.classes || [],
              desc: fetchedSpell.desc
            };
          }
          return null;
        } catch (error) {
          console.warn(`Could not load spell ${spell.name}:`, error);
          return null;
        }
      });

      const spellResults = await Promise.all(spellPromises);
      const validSpells = spellResults.filter((spell): spell is Spell => spell !== null);
      setSpells(validSpells);
    }
  } catch (error) {
    console.error('Error fetching spells:', error);
  } finally {
    setLoading(false);
  }
};

    fetchAllSpells();
  }, [show, characterClass]);

  // Modify the existing methods to work with the new approach
  const handleSpellClick = async (spellIndex: string) => {
    const newSelected = new Set(selectedSpells);
    
    if (newSelected.has(spellIndex)) {
      newSelected.delete(spellIndex);
    }  else {
      newSelected.add(spellIndex);
    }
  
    setSelectedSpells(newSelected);
  };

  useEffect(() => {
    if (!show) {
      setSelectedSpells(new Set());
      setSearchTerm('');
      setSelectedLevel('all');
      setExpandedSpellId(null);
    }
  }, [show]);

const handleAddSpells = () => {
  // Get the newly selected spells
  const selectedSpellsList = spells.filter(spell => 
    selectedSpells.has(spell.index)
  );

  // Convert each spell to match the character spell format
  const newSpells = selectedSpellsList.map(spell => ({
    name: spell.name,
    level: spell.level,
    prepared: false
  }));

  // Create a Map of existing spells for quick lookup
  const existingSpellMap = new Map(
    existingSpells.map(spell => [spell.name, spell])
  );

   // Combine spells, ensuring no duplicates and preserving existing prepared states
   const combinedSpells = [
    ...existingSpells.map(spell => ({
      name: spell.name,
      level: spell.level,
      prepared: spell.prepared
    }))
  ];

  // Add new spells that don't already exist
  newSpells.forEach(newSpell => {
    if (!existingSpellMap.has(newSpell.name)) {
      combinedSpells.push(newSpell);
    }
  });

  // Sort spells by level and then name
  const sortedSpells = combinedSpells.sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name);
  });

  console.log('Final spell list to save:', sortedSpells);
  onAddSpells(sortedSpells);
  setSelectedSpells(new Set());
  onClose();
};

  const handleClose = () => {
    setSelectedSpells(new Set());
    onClose();
  };

const filteredSpells = spells.filter(spell => {
  const matchesSearch = searchTerm === '' || spell.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesClass = !characterClass || 
    spell.classes.some(c => c.name.toLowerCase() === characterClass.toLowerCase());
  const matchesLevel = selectedLevel === 'all' || spell.level === parseInt(selectedLevel);
  return matchesSearch && matchesClass && matchesLevel;
});

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Spells</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="mb-4">
          <Row>
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search spells..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="mb-3"
              >
                <option value="all">All Levels</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? 'Cantrip' : `Level ${i}`}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading spells...</p>
          </div>
        ) : filteredSpells.length === 0 ? (
          <div className="text-center p-4">
            <p>No spells found matching your search criteria.</p>
          </div>
        ) : (
          <>
          <div className="spell-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Row xs={1} md={2} className="g-4">
                {filteredSpells.map((spell) => (
              <Col key={spell.index}>
                <Card 
                  className={`h-100 ${selectedSpells.has(spell.index) ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body 
                    onClick={() => handleSpellClick(spell.index)}
                    className="d-flex flex-column"
                  >
                    <div>
                      <Card.Title className="d-flex justify-content-between">
                        {spell.name}
                        <span className="text-muted">
                          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                        </span>
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {spell.school.name}
                      </Card.Subtitle>
                      <Card.Text className="small">
                        Classes: {spell.classes.map(c => c.name).join(', ')}
                      </Card.Text>
                    </div>
                    
                    {spell.desc && spell.desc.length > 0 && (
                      <div 
                        className="mt-2 d-flex flex-column flex-grow-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div 
                          style={{ 
                            maxHeight: spell.index === expandedSpellId ? 'none' : '3.6em',
                            overflow: 'hidden',
                          }}
                        >
                          <Card.Text className="small text-muted mb-0">
                            {spell.desc[0]}
                          </Card.Text>
                        </div>
                        <div className="mt-auto pt-2 text-end">
                          {spell.index !== expandedSpellId ? (
                            <button
                              className="btn btn-link btn-sm p-0 text-primary"
                              style={{
                                border: 'none',
                                textDecoration: 'none'
                              }}
                              onClick={() => setExpandedSpellId(spell.index)}
                            >
                              Read More
                            </button>
                          ) : (
                            <button 
                              className="btn btn-link btn-sm p-0 text-muted"
                              onClick={() => setExpandedSpellId(null)}
                            >
                              Show Less
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddSpells}
          disabled={selectedSpells.size === 0}
        >
          Add Selected Spells ({selectedSpells.size})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SpellModal;