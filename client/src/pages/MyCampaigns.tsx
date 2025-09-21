import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Container, Card, Row, Col, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CreateCampaignModal from '../components/Campaigns/CreateCampaignModal';

// GraphQL Query to Fetch Campaigns
const GET_CAMPAIGNS = gql`
  query GetCampaigns {
    campaigns {
      _id
      name
      description
      players {
        _id
        basicInfo {
          name
        }
        player {
          _id
          username
        }
      }
      playerCount
    }
  }
`;

// GraphQL Mutation to Delete Campaign
const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id) {
      _id
    }
  }
`;

const MyCampaigns: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGNS);
  const [deleteCampaign] = useMutation(DELETE_CAMPAIGN);
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateCampaignSubmit = () => {
    refetch(); // Refetch campaigns after creating a new one
    setShowCreateModal(false);
  };

  // Handle loading and error states
  if (loading) return <div></div>;
  if (error) return <div>Error fetching campaigns: {error.message}</div>;

  const campaigns = data?.campaigns || [];

  const handleViewCampaign = (campaignId: string) => {
    // Navigate to the CampaignDashboard route with the campaignId
    navigate(`/my-campaigns/${campaignId}`);
  };

  const handleDeleteCampaign = async () => {
    if (selectedCampaignId) {
      try {
        await deleteCampaign({ variables: { id: selectedCampaignId } });
        alert('Campaign deleted successfully!');
        refetch(); // Refetch campaigns after deletion
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
      }
    }
    setShowDeleteModal(false); // Close the delete confirmation modal
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false); // Close the modal if the user cancels
  };

  return (
    <>
      <Container>
        <h1 className="mb-4">My Campaigns</h1>

        <Row xs={1} md={2} lg={3} className="g-4">
          {/* Create Campaign Card */}
          <Col>
            <Card className="character-cards h-100" style={{ cursor: 'pointer' }}>
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <Card.Title>Create a Campaign</Card.Title>
                <Button variant="danger" onClick={handleCreateCampaign}>
                  Start Now
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Display Campaigns */}
          {campaigns.map((campaign: any) => (
            <Col key={campaign._id}>
              <Card className="character-cards">
                <Card.Body>
                  <Card.Title>{campaign.name}</Card.Title>
                  {campaign.description && (
                    <Card.Text>{campaign.description}</Card.Text>
                  )}
                  <Card.Text id="campaign-player-list">
                    Players:
                    <ul>
                      {campaign.players.map((player: any) => (
                        <li key={player._id}>
                          <strong>{player.basicInfo.name}</strong>
                          <br />
                          <small>Player: {player.player.username}</small>
                        </li>
                      ))}
                    </ul>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleViewCampaign(campaign._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaignId(campaign._id); // Store the campaign ID to delete
                        setShowDeleteModal(true); // Show the delete confirmation modal
                      }}
                    >
                      Remove Campaign
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        show={showCreateModal}
        onClose={handleCloseCreateModal}
        onCampaignCreated={handleCreateCampaignSubmit}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this campaign? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteCampaign}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyCampaigns;
