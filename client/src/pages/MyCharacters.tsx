import { useState } from 'react';
import { Container, Button, Card, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHARACTERS } from '../utils/queries';
import { DELETE_CHARACTER } from '../utils/mutations';
import DiceRoller from '../components/DiceRoller/DiceRoller';
import PlayerHandbook  from '../components/PlayerHandbook/PlayerHandbook';

interface Character {
  _id: string;
  basicInfo: {
    name: string;
    class: string;
    level: number;
    avatar: string; // Ensure avatar is correctly placed within basicInfo
  };
}

const MyCharacters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const { data, refetch } = useQuery<{ characters: Character[] }>(GET_CHARACTERS);
  
  const handleCreateCharacter = () => {
    navigate('/my-characters/character-creation');
  };

  const handleViewCharacter = (character: Character) => {
    navigate(`/my-characters/${character._id}`);
    setSelectedCharacter(character);
  };

  const isCreatingCharacter = location.pathname.includes('/character-creation');
  const isViewingCharacter = location.pathname.split('/').length > 2 && !isCreatingCharacter;

  const characters = data?.characters || [];

  const [deleteCharacter] = useMutation(DELETE_CHARACTER, {
    onCompleted: () => {
        alert('Character deleted successfully.');
    },
    onError: (error) => {
        console.error(error);
        alert('Failed to delete the character.');
    },
});

const handleDeleteCharacter = async (id: string, name: string) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
  if (confirmDelete) {
      try {
          await deleteCharacter({ variables: { id } });
          await refetch();
      } catch (error) {
          console.error('Error deleting character:', error);
      }
  }
};


  return (
     <div className="page-layout">
      <PlayerHandbook />
      <div className="main-content">
      <Container>
        {!isCreatingCharacter && !isViewingCharacter && (
          <>
            <div id='my-characters-header' className="d-flex justify-content-between align-items-center mb-4">
              <h1>My Characters</h1>
              <Button variant="primary" onClick={handleCreateCharacter}>
                Create New Character
              </Button>
            </div>

            {characters.length === 0 ? (
              <div className="text-center">
                <p>You haven't created any characters yet.</p>
                <Button variant="outline-primary" onClick={handleCreateCharacter}>
                  Create Your First Character
                </Button>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {characters.map((character) => (
                  <Col key={character._id}>
                    <Card className='character-cards'>
                      <Card.Body>
                        {/* Avatar Image */}
                        <div className="d-flex justify-content-center align-items-center mb-4">
                          <div>
                            {character.basicInfo.avatar && (
                              <img
                                src={character.basicInfo.avatar}
                                alt={`${character.basicInfo.name}'s Avatar`}
                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Character Details */}
                        <Card.Title className="character-card-content">{character.basicInfo.name}</Card.Title>
                        <Card.Text className="character-card-content">
                        Level {character.basicInfo.level} {character.basicInfo.class.charAt(0).toUpperCase() + character.basicInfo.class.slice(1)}
                        </Card.Text>
                        <div className="d-flex justify-content-between gap-2">
                          <Button 
                            className='view-character-button'
                            variant="danger" 
                            size="sm"
                            onClick={() => handleViewCharacter(character)}
                          >
                            View Character
                          </Button>
                          <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteCharacter(character._id, character.basicInfo.name)}
                          >
                              Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        <Modal 
          show={showDiceRoller} 
          onHide={() => setShowDiceRoller(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedCharacter ? `Dice Roller - ${selectedCharacter.basicInfo.name}` : 'Dice Roller'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DiceRoller />
          </Modal.Body>
        </Modal>

        <Outlet />
      </Container>
      </div>
    </div>
  );
};

export default MyCharacters;