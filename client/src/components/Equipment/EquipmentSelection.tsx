import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Card, Row, Col } from 'react-bootstrap';
import { dndApi } from '../../utils/dndApi';

interface EquipmentCategory {
  name: string;
}

interface EquipmentCost {
  quantity: number;
  unit: string;
}

interface EquipmentProperty {
  index: string;
  name: string;
  url: string;
}

export interface Equipment {
  index: string;
  name: string;
  equipment_category: EquipmentCategory;
  cost?: EquipmentCost;
  weight?: number;
  desc?: string[];
  properties?: EquipmentProperty[] | string[];
}

interface ApiEquipmentResult {
  index: string;
  name: string;
  url: string;
}

interface ApiResponse {
  count: number;
  results: ApiEquipmentResult[];
}

interface EquipmentModalProps {
  show: boolean;
  onClose: () => void;
  onAddEquipment: (equipment: Equipment[]) => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ show, onClose, onAddEquipment }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!show) return;

      try {
        setLoading(true);
        const response = await dndApi.getEquipment() as ApiResponse;

        if (response && 'results' in response && Array.isArray(response.results)) {
          const equipmentPromises = response.results.map(async (item) => {
            try {
              const details = await dndApi.getEquipmentItem(item.index);
              return details;
            } catch (error) {
              console.error(`Error fetching details for ${item.index}:`, error);
              return null;
            }
          });

          const equipmentDetails = await Promise.all(equipmentPromises);

          const validEquipment = equipmentDetails.filter(
            (item): item is Equipment => item !== null
          );

          const uniqueCategories = [
            ...new Set(validEquipment.map((item) => item.equipment_category.name)),
          ].sort();

          setCategories(uniqueCategories);
          setEquipment(validEquipment);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [show]);

  const handleEquipmentClick = (equipmentIndex: string) => {
    const newSelected = new Set(selectedEquipment);
    if (newSelected.has(equipmentIndex)) {
      newSelected.delete(equipmentIndex);
    } else {
      newSelected.add(equipmentIndex);
    }
    setSelectedEquipment(newSelected);
  };

  const handleAddEquipment = () => {
    const selectedItems = equipment
      .filter((item) => selectedEquipment.has(item.index))
      .map((item) => ({
        ...item,
        properties: item.properties
          ? item.properties.map((p) =>
              typeof p === 'object' && 'name' in p ? p.name : String(p)
            )
          : [], // Ensure properties is an array of strings
      }));
  
    console.log('Normalized Selected Equipment:', selectedItems); // Debug log
    onAddEquipment(selectedItems);
    setSelectedEquipment(new Set());
    onClose();
  };
  
  

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.equipment_category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Equipment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="mb-4">
          <Row>
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mb-3"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading equipment...</p>
          </div>
        ) : (
          <div className="equipment-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Row xs={1} md={2} className="g-4">
              {filteredEquipment.map((item) => (
                <Col key={item.index}>
                  <Card
                    className={`h-100 ${
                      selectedEquipment.has(item.index) ? 'border-primary' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEquipmentClick(item.index)}
                  >
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {item.equipment_category.name}
                      </Card.Subtitle>
                      {item.cost && (
                        <p className="small mb-1">
                          Cost: {item.cost.quantity} {item.cost.unit}
                        </p>
                      )}
                      {item.weight && (
                        <p className="small mb-1">Weight: {item.weight} lb</p>
                      )}
                      {item.desc && item.desc.length > 0 && (
                        <p className="small text-muted mb-1">{item.desc[0]}</p>
                      )}
                      {item.properties && item.properties.length > 0 && (
                        <p className="small mb-0">
                          Properties: {item.properties.map((p) => typeof p === 'object' && 'name' in p ? p.name : p).join(', ')}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAddEquipment}
          disabled={selectedEquipment.size === 0}
        >
          Add Selected Equipment ({selectedEquipment.size})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EquipmentModal;
