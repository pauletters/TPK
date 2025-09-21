import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { CharacterData } from '../types';

interface EquipmentListProps {
  equipment: CharacterData['equipment'];
  onRemoveEquipment: (name: string) => void;
  setShowEquipmentModal: (show: boolean) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ 
  equipment, 
  onRemoveEquipment,
  setShowEquipmentModal 
}) => {
  return (
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
        {equipment && equipment.length > 0 ? (
          <div className="list-group list-group-flush">
            {equipment.map((item) => (
              <div 
                key={item.name} 
                className="list-group-item"
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
                  </div>
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    className="ms-3"
                    onClick={(e) => {
                      e.stopPropagation();  // Prevent any parent onClick event from firing
                      onRemoveEquipment(item.name);  // Call the passed down function to remove the item
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
);
};

export default EquipmentList;