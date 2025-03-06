import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://raja-mantri-game.onrender.com"); // Replace with your backend URL

function App() {
  const [players, setPlayers] = useState({});
  const [role, setRole] = useState("");
  const [sipahiGuess, setSipahiGuess] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("updatePlayers", (playerList) => setPlayers(playerList));
    socket.on("startGame", (playerData) => {
      setPlayers(playerData);
      setRole(playerData[socket.id]?.role);
    });
    socket.on("roundResult", ({ result }) => setMessage(result.message));

    return () => socket.disconnect();
  }, []);

  const joinGame = () => {
    const playerName = prompt("Enter your name:");
    socket.emit("joinGame", playerName);
  };

  const makeGuess = () => {
    socket.emit("makeGuess", { sipahiId: socket.id, guessedPlayerId: sipahiGuess });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎭 Raja Mantri Chor Sipahi 🎭</h1>
      {!role ? (
        <button onClick={joinGame}>Join Game</button>
      ) : (
        <>
          <h2>Your Role: {role}</h2>
          <h3>Players:</h3>
          <ul>
            {Object.entries(players).map(([id, player]) => (
              <li key={id}>
                {player.name} - {player.points} points
              </li>
            ))}
          </ul>
          {role === "Sipahi" && (
            <div>
              <h3>Guess the Chor:</h3>
              <select onChange={(e) => setSipahiGuess(e.target.value)}>
                <option value="">Select Player</option>
                {Object.entries(players).map(
                  ([id, player]) => id !== socket.id && <option key={id} value={id}>{player.name}</option>
                )}
              </select>
              <button onClick={makeGuess}>Submit Guess</button>
            </div>
          )}
          <h3>{message}</h3>
        </>
      )}
    </div>
  );
}

export default App;
