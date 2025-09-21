import React, { useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';

interface SpellCardProps {
  name: string;
  level: number;
  prepared: boolean;
  description?: string;
  school?: string;
  fullSpellDetails?: {
    range?: string;
    castingTime?: string;
    duration?: string;
    components?: string[];
    classes?: string[];
  };
  onRemove: () => void;
  onTogglePrepared: () => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ 
  name, 
  level, 
  prepared,
  description,
  school, 
  fullSpellDetails,
  onRemove,
  onTogglePrepared 
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const renderDescription = () => {
    if (!description) return null;

    const maxLength = 100;
    if (description.length <= maxLength && !isExpanded) {
      return (
        <p className="small text-muted mb-3">
          {description}
        </p>
      );
    }

    return (
      <p 
        className="small text-muted mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => (e.currentTarget.style.cursor = 'pointer')}
        onMouseLeave={(e) => (e.currentTarget.style.cursor = 'default')}
      >
        {isExpanded ? description : `${description.substring(0, maxLength)}...`}
        <span className="text-primary ml-1">
          {isExpanded ? ' (Show Less)' : ' (Read More)'}
        </span>
      </p>
    );
  };

  return (
    <>
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div className="spell-name-container">
              <h5 className="mb-1 spell-name">{name}</h5>
              <p className="text-muted mb-2">
                {level === 0 ? 'Cantrip' : `Level ${level}`}
                {school && ` • ${school}`}
              </p>
            </div>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              ×
            </Button>
          </div>
          {renderDescription()}
            
            <div className="d-flex justify-content-between align-items-center">
            <Button
              variant={prepared ? "success" : "outline-secondary"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                console.log('Toggle button clicked:', {
                  spellName: name,
                  currentPreparedStatus: prepared,
                  level,
                  toggleAction: 'Setting prepared to ' + (!prepared)
                });
                onTogglePrepared();
              }}
              className="flex-grow-1 mr-3 btn-sm"
            >
              {prepared ? 'Prepared' : 'Not Prepared'}
            </Button>
          {description && (
                <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowFullDetails(true)}
                className="btn-outline-primary ml-3 btn-sm btn-spaced"
                >
                  Full Details
                </Button>
              )}
            </div>
        </Card.Body>
      </Card>

      <Modal
        show={showFullDetails} 
        onHide={() => {
          setShowFullDetails(false);
      }} 
      centered>
      <Modal.Header closeButton>
        <Modal.Title>{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="font-weight-bold">
          {level === 0 ? 'Cantrip' : `Level ${level}`} 
          {school && ` • ${school}`}
        </p>
        
        {fullSpellDetails && (
          <div className="mb-3">
            {fullSpellDetails.castingTime && (
              <p><strong>Casting Time:</strong> {fullSpellDetails.castingTime}</p>
            )}
            {fullSpellDetails.range && (
              <p><strong>Range:</strong> {fullSpellDetails.range}</p>
            )}
            {fullSpellDetails.duration && (
              <p><strong>Duration:</strong> {fullSpellDetails.duration}</p>
            )}
            {fullSpellDetails.components && (
              <p>
                <strong>Components:</strong> {fullSpellDetails.components.join(', ')}
              </p>
            )}
            {fullSpellDetails.classes && (
              <p>
                <strong>Classes:</strong> {fullSpellDetails.classes.join(', ')}
              </p>
            )}
          </div>
        )}
        
        <p>{description}</p>
      </Modal.Body>
      </Modal>
    </>
  );
};

export default SpellCard;