import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_USERS } from '../utils/queries';
import { UPDATE_CAMPAIGN } from '../utils/mutations';

// Define types for characters and campaigns
interface Character {
  _id: string;
  player: {
    username: string;
  };
  basicInfo: {
    name: string;
    race: string;
    class: string;
    level: number;
  };
  private: boolean;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  players: Character[];
  milestones: string[];
  createdBy: {
    _id: string;
  };
}

interface CampaignDashboardProps {
  campaign: Campaign;
  userId: string;
  onAddCharacter: (characterId: string) => void;
  onAddMilestone: (milestone: string) => void;
  onRemoveMilestone: (index: number) => void;
  onUpdateCampaign: (name: string, description: string) => void;
}

// Custom debounce implementation
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaign,
  userId,
  onAddCharacter,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState(campaign.name);
  const [editedDescription, setEditedDescription] = useState(campaign.description);
  const [localMilestones, setLocalMilestones] = useState(campaign.milestones);

  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ _id: string; username: string; characters: Character[] } | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false); // Manage dropdown visibility

  const [searchUsers, { data: searchResults, loading }] = useLazyQuery(SEARCH_USERS, {
    fetchPolicy: 'network-only',
  });

  const [updateCampaign] = useMutation(UPDATE_CAMPAIGN);

  const debouncedSearch = useDebounce((term: string) => {
    if (term.trim() !== '') {
      searchUsers({ variables: { term } });
      setShowDropdown(true); // Show dropdown when searching
    } else {
      setShowDropdown(false); // Hide dropdown if search is cleared
    }
  }, 300);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSelectUser = (user: { _id: string; username: string; characters: Character[] }) => {
    setSelectedUser(user);
    setSearchTerm(''); // Clear search term
    setShowDropdown(false); // Close dropdown when a user is selected
  };

  const handleSelectCharacter = (character: Character) => {
    onAddCharacter(character._id);
    setShowAddCharacterModal(false);
    setSelectedUser(null); // Reset user selection after adding a character
  };

  const handleCardClick = (character: Character) => {
    if (!character.private) {
      setSelectedCharacter(character);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCharacter(null);
  };

  const handleAddMilestone = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newMilestone.trim() !== '') {
      try {
        const { data } = await updateCampaign({
          variables: {
            id: campaign._id,
            addMilestones: [newMilestone],
          },
        });
        setLocalMilestones(data.updateCampaign.milestones);
        setNewMilestone('');
      } catch (error) {
        console.error('Error adding milestone:', error);
      }
    }
  };

  const handleRemoveMilestone = async (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    try {
      const { data } = await updateCampaign({
        variables: {
          id: campaign._id,
          removeMilestoneIndex: index,
        },
      });
      setLocalMilestones(data.updateCampaign.milestones);
    } catch (error) {
      console.error('Error removing milestone:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await updateCampaign({
        variables: {
          id: campaign._id,
          name: editedName,
          description: editedDescription,
        },
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving campaign changes:', error);
    }
  };

  const handleRemoveCharacter = async (characterId: string) => {
    try {
      await updateCampaign({
        variables: {
          id: campaign._id,
          removePlayers: [characterId],
        },
      });
      campaign.players = campaign.players.filter((player) => player._id !== characterId); // Update players locally
    } catch (error) {
      console.error('Error removing character:', error);
    }
  };

  const handleCloseAddCharacterModal = () => {
    setShowAddCharacterModal(false);
    setSelectedUser(null); // Reset selection
  };

  return (
    <>
      <Container>
        {/* Campaign Header */}
        <h1 className="mb-4">
          {isEditMode ? (
            <Form.Control
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
          ) : (
            campaign.name
          )}
        </h1>
        {isEditMode ? (
          <Form.Control
            as="textarea"
            rows={2}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        ) : (
          <p>{campaign.description}</p>
        )}

        {userId === campaign.createdBy._id && !isEditMode && (
          <Button variant="primary" onClick={() => setIsEditMode(true)}>
            Edit Campaign
          </Button>
        )}

        {isEditMode && (
          <div className="mt-3">
            <Button variant="success" onClick={handleSaveChanges}>
              Save Changes
            </Button>{' '}
            <Button variant="secondary" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Campaign Players */}
        <Row xs={1} md={2} lg={3} className="g-4 mt-4">
          {campaign.players.map((character) => (
            <Col key={character._id}>
              <Card
                className="character-cards h-100"
                style={{
                  cursor: character.private ? 'not-allowed' : 'pointer',
                  opacity: character.private ? 0.6 : 1,
                }}
                onClick={() => !isEditMode && handleCardClick(character)}
              >
                <Card.Body>
                  <Card.Title>{character.basicInfo.name}</Card.Title>
                  <Card.Text>
                    Player: {character.player.username}
                    <br />
                    Race: {character.basicInfo.race.charAt(0).toUpperCase() + character.basicInfo.race.slice(1)}
                    <br />
                    Class: {character.basicInfo.class.charAt(0).toUpperCase() + character.basicInfo.class.slice(1)}
                    <br />
                    Level: {character.basicInfo.level}
                  </Card.Text>
                  {isEditMode && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleRemoveCharacter(character._id);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}

          {isEditMode && (
            <Col>
              <Card
                className="character-cards h-100 d-flex align-items-center justify-content-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAddCharacterModal(true)}
              >
                <Card.Body className="card-body no-left-border">
                  <Card.Title>Add Character</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Milestones Section */}
        <div className="mt-5">
          <h2>Milestones</h2>
          {localMilestones.length > 0 ? (
            <ul className="list-group mb-3">
              {localMilestones.map((milestone, index) => (
                <><li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {milestone}
                </li>
                <Button id='remove-milestone-button' variant="danger" size="sm" onClick={(e) => handleRemoveMilestone(e, index)}>
                    Remove
                </Button></>
              ))}
            </ul>
          ) : (
            <p>No milestones added yet.</p>
          )}
          <Form onSubmit={handleAddMilestone}>
            <Form.Group controlId="addMilestone">
              <Form.Label>Add a New Milestone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a milestone"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
              />
            </Form.Group>
            <Button className="mt-2" variant="primary" type="submit">
              Add Milestone
            </Button>
          </Form>
        </div>
      </Container>

      {/* Add Character Modal */}
      <Modal show={showAddCharacterModal} onHide={handleCloseAddCharacterModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add a Character</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* User Search */}
          <Form.Group>
            <Form.Label>Search Users</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search users by name"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </InputGroup>
            {loading ? (
              <p>Loading...</p>
            ) : (
              showDropdown && searchResults?.searchUsers?.length > 0 && (
                <Dropdown.Menu 
                  show
                  style={{
                    maxHeight: '200px', // Limits dropdown height to approximately 5 lines
                    overflowY: 'auto', // Enables vertical scrolling
                  }}
                >
                  {searchResults.searchUsers.map((user: any) => (
                    <Dropdown.Item
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.username}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )
            )}
          </Form.Group>

          {/* Select Character */}
          {selectedUser && (
            <Form.Group>
              <Form.Label>Select a Character from {selectedUser.username}</Form.Label>
              {selectedUser.characters.length > 0 ? (
                <Dropdown.Menu show>
                  {selectedUser.characters.map((character) => (
                    <Dropdown.Item
                      key={character._id}
                      onClick={() => handleSelectCharacter(character)} // Pass character to handleSelectCharacter
                    >
                      {character.basicInfo.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              ) : (
                <p>No characters available for {selectedUser.username}.</p>
              )}
            </Form.Group>
          )}
        </Modal.Body>
      </Modal>


      {/* Character Modal */}
      {selectedCharacter && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedCharacter.basicInfo.name}'s Character Sheet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Player:</strong> {selectedCharacter.player.username}
              <br />
              <strong>Race:</strong> {selectedCharacter.basicInfo.race.charAt(0).toUpperCase() + selectedCharacter.basicInfo.race.slice(1)}
              <br />
              <strong>Class:</strong> {selectedCharacter.basicInfo.class.charAt(0).toUpperCase() + selectedCharacter.basicInfo.class.slice(1)}
              <br />
              <strong>Level:</strong> {selectedCharacter.basicInfo.level}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default CampaignDashboard;
