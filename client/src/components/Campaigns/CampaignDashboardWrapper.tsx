import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import CampaignDashboard from '../../pages/CampaignDashboard';
import AuthService from '../../utils/auth'; // Assuming this provides user information

// GraphQL Query to Fetch Campaign Data
const GET_CAMPAIGN = gql`
  query GetCampaign($campaignId: ID!) {
    campaign(id: $campaignId) {
      _id
      name
      description
      players {
        _id
        player {
          username
        }
        basicInfo {
          name
          race
          class
          level
        }
        private
      }
      milestones
      createdBy {
        _id
        username
      }
    }
  }
`;

// GraphQL Mutation to Update Campaign
const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign(
    $id: ID!
    $name: String
    $description: String
    $addPlayers: [ID!]
    $removePlayers: [ID!]
  ) {
    updateCampaign(
      id: $id
      name: $name
      description: $description
      addPlayers: $addPlayers
      removePlayers: $removePlayers
    ) {
      _id
      name
      description
      players {
        _id
        player {
          username
        }
        basicInfo {
          name
        }
      }
    }
  }
`;

const CampaignDashboardWrapper: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();

  if (!campaignId) {
    return <div>Error: No campaign ID provided.</div>;
  }

  const currentUser = AuthService.getProfile(); // Assuming this provides user data
  const userId = currentUser?.data._id || '';

  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN, {
    variables: { campaignId },
    onCompleted: (data) => {
      console.log('Fetched Campaign Data:', data);
    },
    onError: (err) => {
      console.error('Error Fetching Campaign Data:', err);
    },
  });

  const [updateCampaign] = useMutation(UPDATE_CAMPAIGN, {
    onCompleted: () => {
      console.log('Campaign updated successfully');
      refetch();
    },
    onError: (err) => {
      console.error('Error updating campaign:', err);
    },
  });

  const onAddMilestone = (milestone: string) => {
    console.log('Add Milestone:', milestone);
  };

  const onRemoveMilestone = (index: number) => {
    console.log('Remove Milestone at index:', index);
  };

  const onAddCharacter = (characterId: string) => {
    console.log('Add Character:', characterId);
    updateCampaign({
      variables: {
        id: campaignId,
        addPlayers: [characterId],
      },
    });
  };

 
  

  const onEditCampaign = (name?: string, description?: string) => {
    console.log('Edit Campaign:', { name, description });
    updateCampaign({
      variables: {
        id: campaignId,
        name,
        description,
      },
    });
  };

  if (loading) return <div>Loading campaign data...</div>;
  if (error) return <div>Error loading campaign: {error.message}</div>;

  const campaign = data?.campaign;

  if (!campaign) {
    return <div>No campaign found for ID: {campaignId}</div>;
  }

  return (
    <CampaignDashboard
      campaign={campaign}
      onAddMilestone={onAddMilestone}
      onRemoveMilestone={onRemoveMilestone}
      onAddCharacter={onAddCharacter}
      onUpdateCampaign={onEditCampaign} // Pass the edit handler
      userId={userId}
    />
  );
};

export default CampaignDashboardWrapper;
