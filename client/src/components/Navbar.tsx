import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Modal, Tab } from 'react-bootstrap';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import AuthService from '../utils/auth'
import tpkLogo from '../assets/tpkLogo.png';


const AppNavbar = () => {
  // set modal display state
  const [showModal, setShowModal] = useState(false);

  // check if user is logged in
  const isLoggedIn = AuthService.loggedIn();

  return (
    <>
    <div className='hero-section'>
      <Navbar bg='dark' variant='dark' expand='lg'>
        <Container fluid>
          <Navbar.Brand as={Link} to='/about' className='navbar-brand'>
            <img
              src={tpkLogo}
              alt='TPK logo'
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='navbar' />
          <Navbar.Collapse id='navbar' className='flex-row-reverse'>
            <Nav className='ml-auto d-flex align-items-center'>
            <Nav.Link as={Link} to='/about' className='navLink'>
                About
              </Nav.Link>
              {isLoggedIn ? (
                <>
                <Nav.Link as={Link} to='/my-characters' className='nav-link'>
                  My Characters
                </Nav.Link>
                <Nav.Link as={Link} to='/my-campaigns' className='nav-link'>
                    My Campaigns
                  </Nav.Link>
                <Nav.Link onClick={AuthService.logout} className='nav-link nav-logout'>
                  Logout
                </Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={() => setShowModal(true)} className='nav-link nav-auth-link'>
                  Login/Sign Up
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>

      {/* set modal data up */}
      <Modal
        size='lg'
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby='signup-modal'>
        {/* tab container to do either signup or login component */}
        <Tab.Container defaultActiveKey='login'>
          <Modal.Header closeButton style={{marginTop: '0px'}}>
            <Modal.Title id='signup-modal'>
              <Nav variant='pills'>
                <Nav.Item>
                  <Nav.Link eventKey='login'>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='signup'>Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey='login'>
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey='signup'>
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;
