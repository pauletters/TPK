  import { Container } from 'react-bootstrap';

  const About = () => {
    return (
        <div className="about-page">
          
          <Container className="hero-content">
            <h1 className="hero-title">Total Player Knowledge</h1>
            <h2 className="hero-subtitle">About</h2>
            <h5 className="hero-subtitle-2">It's the TPK you'll actually want to experience!</h5>
          </Container>

        <Container className="content-section">
          <p className="welcome-text">
          Welcome to TPK - your ultimate companion for character creation and campaign management.
          Join us to create, manage, and bring your characters to life!
        </p>

        {/* Features List */}
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-emoji">🎭</span>
            <strong>Forge Your Heroes:</strong> Create and customize your characters with our intuitive 
            character builder. Choose from classic D&D races, classes, and backgrounds to craft your 
            perfect adventurer.
          </div>

          <div className="feature-item">
            <span className="feature-emoji">✨</span>
            <strong>Master the Arcane:</strong> Browse and add spells to your spellbook, track prepared 
            spells, and keep your magical arsenal organized and ready for any encounter.
          </div>

          <div className="feature-item">
            <span className="feature-emoji">⚔️</span>
            <strong>Gear Up for Adventure:</strong> Equip your character with weapons, armor, and 
            magical items. Our comprehensive equipment system makes inventory management a breeze.
          </div>

          <div className="feature-item">
            <span className="feature-emoji">🛡️</span>
            <strong>Join Epic Campaigns:</strong> Connect with fellow adventurers, join campaigns, 
            and let your Dungeon Master track your progress through legendary quests and dangerous 
            dungeons.
          </div>

          <div className="feature-item">
            <span className="feature-emoji">🎲</span>
            <strong>Roll with Style:</strong> Use our built-in 3D dice roller to make dramatic rolls 
            during your gaming sessions - because every natural 20 deserves some flair!
          </div>
        </div>

        {/* Closing Text */}
        <p className="welcome-text">
          Whether you're a seasoned adventurer or just starting your first quest, TPK provides all 
          the tools you need to manage your tabletop adventures. And yes, this is the TPK (Total 
          Player Knowledge) you'll actually want to experience - no character death required!
        </p>

        {/* Call to Action */}
        <p className="call-to-action">
          Ready to begin your journey? Create your first character and join a campaign today!
        </p>
      </Container>
    </div>
    );
  };
  
  export default About;

