import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import AuthService from '../../utils/auth';
import '../../styles/diceBox.css';

interface PersistentDiceRollerProps {
  DiceRoller: React.ComponentType;
}

const PersistentDiceRoller: React.FC<PersistentDiceRollerProps> = ({ DiceRoller }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Detect if the screen size is small
  const isSmallScreen = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    // Only show the dice roller if user is logged in
    const checkAuth = () => {
      setIsVisible(AuthService.loggedIn());
    };

    // Initial check
    checkAuth();

    // Set up event listener for auth changes
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);


  if (!isVisible) return null;

  return (
    <>
      {isSmallScreen ? (
        <>
          <Button
            variant="primary"
            onClick={toggleModal}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}
          >
            Dice Roller
          </Button>
          <Modal
            show={isModalOpen}
            onHide={toggleModal}
            centered
            backdrop={true} // Close modal on backdrop click
            animation={true} // Optional fade animation
            style={{ zIndex: 1100 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Dice Roller</Modal.Title>
            </Modal.Header>
            <Modal.Body id='dice-roller-body'>
              <DiceRoller />
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <div
          className="position-fixed"
      style={{ 
        top: '155px', 
        right: '0', // Ensure it stays on the right side
        zIndex: 1050,
        transition: 'transform 0.3s ease-in-out',
        transform: `translateX(${isCollapsed ? 'calc(100% - 50px)' : '0'})` 
      }} 
    >
      <div className="d-flex">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn btn-light border d-flex flex-column align-items-center justify-content-center gap-2"
          style={{ 
            height: '80px',
            width: '50px',
            borderRadius: '8px 0 0 8px',
            padding: '4px',
            backgroundColor: isCollapsed ? 'red' : 'lightgray',
            color: isCollapsed ? 'white' : 'black'
          }}
          aria-label={isCollapsed ? "Expand dice roller" : "Collapse dice roller"}
          data-testid="dice-roller-toggle"
        >
          {isCollapsed ? <ChevronLeft size={50} /> : <ChevronRight size={50} />}
          <div 
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'mixed', 
              transform: 'rotate(270deg)',
              fontSize: '0.875rem'
            }}
          >
            Dice Roller
          </div>
        </button>
  
        <div 
          style={{
            width: '500px',  // Width of the dice roller container
            maxHeight: '80vh',
            overflowY: 'auto', // Enables vertical scrolling
            overflowX: 'hidden', // Prevents horizontal scrolling
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            
          }}
        >
          <Card 
            className="border-start-0 rounded-0 dice-roller-card"
            style={{ maxWidth: '500px', borderRadius: '5px'
              }}  // Increased to match
          >
            <DiceRoller />
          </Card>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default PersistentDiceRoller;