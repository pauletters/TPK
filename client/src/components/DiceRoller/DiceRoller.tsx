import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DiceBox from '@3d-dice/dice-box';

interface DieType {
  sides: number;
  name: string;
}

interface RollEntry {
  id: number;
  die: string;
  numberOfDice: number;
  rolls: number[];
  total: number;
  timestamp: string;
}

interface RollResult {
  qty: number;       // Number of dice rolled
  modifier: number;  // Modifier applied to the roll (if any)
  sides: number;     // Number of sides on the die
  rolls: { value: number }[];  // Individual roll results
  id: number;        // ID for the roll
}

const DiceRoller: React.FC = () => {
  const diceBoxRef = useRef<any>(null);

  const diceTypes: DieType[] = [
    { sides: 4, name: 'd4' },
    { sides: 6, name: 'd6' },
    { sides: 8, name: 'd8' },
    { sides: 10, name: 'd10' },
    { sides: 12, name: 'd12' },
    { sides: 20, name: 'd20' },
    { sides: 100, name: 'd100' }
  ];

  const [selectedDie, setSelectedDie] = useState<DieType>(diceTypes[5]);  // Default to d20
  const [currentRoll, setCurrentRoll] = useState<RollEntry | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>(() => {
    const savedHistory = localStorage.getItem('diceRollHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [numberOfDice, setNumberOfDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  useEffect(() => {
    const initDiceBox = async () => {
      const Box = new DiceBox("#dice-box", {
        assetPath: '/assets/dice-box/',
        theme: 'default',
        scale: 8,
        gravity: 2,
        mass: 1,
        friction: 0.8,
        restitution: 0.5,
        linearDamping: 0.5,
        angularDamping: 0.4,
        sounds: true, // Enable sounds
        volume: 100,  // Set volume (0 to 100)
      });

      await Box.init();
      diceBoxRef.current = Box;

      Box.onRollComplete = (results: RollResult[]) => {
        console.log("Roll results:", results);  // Log the results to confirm the number of dice rolled
        updateRollHistory(results);
      };
    };

    initDiceBox();

    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('diceRollHistory', JSON.stringify(rollHistory));
  }, [rollHistory]);

  const updateRollHistory = (results: RollResult[]) => {
    const result = results[0];
    const rolls = result.rolls;
    const rollValues = rolls.map((roll) => roll.value);
    const totalRoll = rollValues.reduce((sum: number, roll: number) => sum + roll, 0);
  
    // Extract die type from the notation string (e.g., "2d20" -> "d20")
    const dieType = diceTypes.find(die => die.sides === result.sides);
    const dieName = dieType ? dieType.name : `d${result.sides}`;
  
    const rollEntry = {
      id: Date.now(),
      die: dieName,
      numberOfDice: result.qty,
      rolls: rollValues,
      total: totalRoll,
      timestamp: new Date().toLocaleTimeString()
    };
  
    setCurrentRoll(rollEntry);
    setRollHistory(prev => [rollEntry, ...prev].slice(0, 10));
    setIsRolling(false);
  };
  const rollDice = () => {
    setIsRolling(true);
    const notation = `${numberOfDice}${selectedDie.name}`;  // Ensure that selectedDie.name is passed correctly
    diceBoxRef.current?.roll(notation);

    // Array of sound file paths
    const sounds = [
      '/assets/dice-box/sounds/surfaces/surface_wood_table7.mp3',
      '/assets/dice-box/sounds/surfaces/surface_wood_tray2.mp3',
      '/assets/dice-box/sounds/surfaces/surface_wood_table3.mp3',
      '/assets/dice-box/sounds/surfaces/surface_wood_tray4.mp3',
      '/assets/dice-box/sounds/surfaces/surface_wood_table5.mp3',
      // Add more sounds as needed
    ];

    // Play sound for each die rolled
    for (let i = 0; i < numberOfDice; i++) {
      const audio = new Audio(sounds[i % sounds.length]); // Loop through sounds if there are more dice than sounds
      audio.play().catch(error => console.error("Error playing sound:", error));
    }
  };

  const clearHistory = () => {
    setRollHistory([]);
    setCurrentRoll(null);
    localStorage.removeItem('diceRollHistory');
    diceBoxRef.current?.clear();
  };

  return (
    <Card style={{ maxWidth: '48rem', margin: '0 auto', color: '#fff' }}
      className="dice-roller-card"
    >
      <Card.Header>
        <Card.Title>3D Dice Roller</Card.Title>
      </Card.Header>
      <Card.Body>
        <div id='dice-roller-menu' className="d-flex gap-3 mb-4">
          <Form.Select
            style={{ width: '120px' }}
            value={numberOfDice}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setNumberOfDice(newValue);
              console.log("Number of dice updated to:", newValue);
            }}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>
                {num} Di{num === 1 ? 'e' : 'ce'}
              </option>
            ))}
          </Form.Select>

          <Form.Select
            style={{ width: '120px' }}
            value={selectedDie.name}
            onChange={(e) => {
              const die = diceTypes.find(die => die.name === e.target.value);
              if (die) setSelectedDie(die);
            }}
          >
            {diceTypes.map(die => (
              <option key={die.name} value={die.name}>{die.name}</option>
            ))}
          </Form.Select>

          <Button
            variant="primary"
            onClick={rollDice}
            disabled={isRolling}
          >
            {isRolling ? 'Rolling...' : `Roll ${numberOfDice} ${selectedDie.name}`}
          </Button>

          <Button style={{ color: 'white' }}
            variant="outline-secondary"
            onClick={clearHistory}
            disabled={rollHistory.length === 0 || isRolling}
          >
            Clear History
          </Button>
        </div>

        <div id="dice-box" style={{ width: '100%', height: '35vh', marginBottom: '2rem', border: '1px solid #ccc' }}></div>

        {currentRoll && !isRolling && (
          <div className="mb-4 p-3 bg-light rounded">
            <h3 className="fw-bold">Total Roll: {currentRoll.total}</h3>
            <div className="text-secondary">
              Rolled {currentRoll.numberOfDice} {currentRoll.die}: {currentRoll.rolls.join(', ')}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3" style={{ color: 'white' }}>Roll History</h3>
          {rollHistory.length === 0 ? (
            <p className="text-secondary">No rolls yet</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {rollHistory.map((roll) => (
                <div key={roll.id} className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <div style={{ color: 'black' }}>
                    <span className="fw-medium">{roll.numberOfDice} {roll.die}</span>
                    <span className="ms-2 text-secondary">
                      Rolls: {roll.rolls.join(', ')}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2" style={{ color: 'black' }}>
                    <span className="fw-bold">Total: {roll.total}</span>
                    <span className="text-secondary small">{roll.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DiceRoller;
