import { Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const UserMenu = () => {
  const location = useLocation();

  return (
    <div className="user-menu">
    <Container>
      <Nav className="justify-content-center py-2">
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/my-characters"
            className={`nav-link ${location.pathname === '/my-characters' ? 'active' : ''}`}
          >
            My Characters
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/my-campaigns"
            className={`nav-link ${location.pathname === '/my-campaigns' ? 'active' : ''}`}
          >
            My Campaigns
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Container>
    </div>
  );
};

export default UserMenu;