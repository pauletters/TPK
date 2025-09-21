import React, { useState, useEffect, useCallback } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { Modal, Button, Form, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';

// Types for Users and Characters
interface Character {
  _id: string;
  basicInfo: {
    name: string;
  };
}

interface User {
  _id: string;
  username: string;
  characters: Character[];
}

interface CreateCampaignModalProps {
  show: boolean;
  onClose: () => void;
  onCampaignCreated: () => void;
}

// GraphQL Query to Fetch Users and Characters
const SEARCH_USERS = gql`
  query SearchUsers($term: String!) {
    searchUsers(term: $term) {
      _id
      username
      characters {
        _id
        basicInfo {
          name
        }
      }
    }
  }
`;

// GraphQL Mutation to Add a Campaign
const ADD_CAMPAIGN = gql`
  mutation AddCampaign($name: String!, $description: String, $players: [ID!]!) {
    addCampaign(name: $name, description: $description, players: $players) {
      _id
      name
      description
      players {
        _id
        basicInfo {
          name
        }
      }
      createdBy {
        _id
        username
      }
    }
  }
`;

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

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  show,
  onClose,
  onCampaignCreated,
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<
    { id: string; characterName: string; username: string }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchUsers, { data: searchResults, error: searchError }] = useLazyQuery(SEARCH_USERS, {
    fetchPolicy: 'network-only',
  });
  const [addCampaign, { loading: addingCampaign, error: addCampaignError }] = useMutation(
    ADD_CAMPAIGN
  );

  const debouncedSearch = useDebounce((term: string) => {
    if (term.trim() !== '') {
      searchUsers({ variables: { term } });
    }
  }, 300);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) debouncedSearch(term);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(''); // Clear search term
  };

  const handleSelectCharacter = (characterId: string, characterName: string) => {
    if (!selectedPlayers.some((player) => player.id === characterId) && selectedUser) {
      setSelectedPlayers((prev) => [
        ...prev,
        { id: characterId, characterName, username: selectedUser.username },
      ]);
    }
    setSelectedUser(null); // Reset user selection
    setSearchTerm(''); // Clear search term
  };

  const handleCreate = async () => {
    if (campaignName.trim() && campaignDescription.trim() && selectedPlayers.length > 0) {
      try {
        await addCampaign({
          variables: {
            name: campaignName,
            description: campaignDescription,
            players: selectedPlayers.map((player) => player.id),
          },
        });
        onCampaignCreated();
        onClose();
      } catch (error) {
        console.error('Error creating campaign:', error);
      }
    } else {
      alert('Please complete all fields and select players.');
    }
  };

  useEffect(() => {
    if (searchError) {
      console.error('Error fetching users:', searchError);
    }
  }, [searchError]);

  useEffect(() => {
    if (addCampaignError) {
      console.error('Error adding campaign:', addCampaignError);
    }
  }, [addCampaignError]);

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* Modal Header */}
      <Modal.Header closeButton>
        <Modal.Title>Create Campaign</Modal.Title>
      </Modal.Header>
      {/* Modal Body */}
      <Modal.Body>
        {/* Campaign Name */}
        <Form.Group className="mb-3">
          <Form.Label>Campaign Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
        </Form.Group>
        {/* Campaign Description */}
        <Form.Group className="mb-3">
          <Form.Label>Campaign Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            maxLength={100}
            placeholder="Enter a short description (max 100 characters)"
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
          />
          <Form.Text>{100 - campaignDescription.length} characters remaining</Form.Text>
        </Form.Group>
        {/* Search Users */}
        <Form.Group className="mb-3">
          <Form.Label>Search for Users</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search users by name"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
          {searchTerm && searchResults?.searchUsers && (
             <Dropdown.Menu 
             show
             style={{
               maxHeight: '200px', // Limits dropdown height to approximately 5 lines
               overflowY: 'auto', // Enables vertical scrolling
             }}
           >
             {searchResults.searchUsers.map((user: User) => (
               <Dropdown.Item key={user._id} onClick={() => handleSelectUser(user)}>
                 {user.username}
               </Dropdown.Item>
             ))}
           </Dropdown.Menu>
          )}
        </Form.Group>
        {/* Select Characters */}
        {selectedUser && (
          <Form.Group className="mb-3">
            <Form.Label>Select a Character from {selectedUser.username}</Form.Label>
            {selectedUser.characters.length > 0 ? (
              <DropdownButton title="Select Character" className="mb-3">
                {selectedUser.characters.map((character) => (
                  <Dropdown.Item
                    key={character._id}
                    onClick={() =>
                      handleSelectCharacter(character._id, character.basicInfo.name)
                    }
                  >
                    {character.basicInfo.name}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            ) : (
              <p>No characters available for {selectedUser.username}.</p>
            )}
          </Form.Group>
        )}
        {/* Selected Players */}
        {selectedPlayers.length > 0 && (
          <Form.Group className="mt-3">
            <Form.Label>Selected Characters</Form.Label>
            <ul>
              {selectedPlayers.map((player) => (
                <li key={player.id}>
                  <strong>{player.characterName}</strong>
                  <br />
                  <small>Player: {player.username}</small>
                </li>
              ))}
            </ul>
          </Form.Group>
        )}
      </Modal.Body>
      {/* Modal Footer */}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={addingCampaign}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate} disabled={addingCampaign}>
          {addingCampaign ? 'Creating...' : 'Create Campaign'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateCampaignModal;