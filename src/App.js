import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://raja-mantri-backend.onrender.com");

function App() {
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState({});
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerRole, setPlayerRole] = useState("");
    const [isSipahiTurn, setIsSipahiTurn] = useState(false);

    useEffect(() => {
        socket.on("connect", () => console.log(`✅ Connected as ${socket.id}`));

        socket.on("updatePlayers", setPlayers);

        socket.on("gameStarted", (playerList) => {
            console.log("🚀 Game Started!", playerList);
            setPlayers(playerList);
            setGameStarted(true);

            if (playerList[socket.id]) {
                setPlayerRole(playerList[socket.id].role);
            }
        });

        socket.on("yourTurnToGuess", () => {
            console.log("🤔 You are the Sipahi! Guess who is the Chor.");
            setIsSipahiTurn(true);
        });

        socket.on("roundResult", ({ success, players }) => {
            setPlayers(players);
            alert(success ? "✅ Correct guess! Points stay the same." : "❌ Wrong guess! Points swapped.");
            setIsSipahiTurn(false);
        });

        return () => socket.disconnect();
    }, []);

    const handleJoin = () => {
        if (playerName.trim() !== "") {
            socket.emit("joinGame", playerName, (response) => {
                if (response.success) setIsJoined(true);
                else alert(response.message);
            });
        } else {
            alert("❌ Please enter a valid name!");
        }
    };

    const handleGuess = (guessedId) => {
        if (isSipahiTurn) {
            console.log("🔍 Sipahi guessed:", guessedId);
            socket.emit("sipahiGuess", guessedId);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>🎮 Raja Mantri Chor Sipahi Game</h1>

            {!isJoined ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button onClick={handleJoin}>Join Game</button>
                </div>
            ) : gameStarted ? (
                <div>
                    <h2>✅ Game Started!</h2>
                    <h3>Your Role: {playerRole}</h3>

                    {isSipahiTurn && (
                        <div>
                            <h3>Guess Who is the Chor?</h3>
                            {Object.values(players)
                                .filter(player => player.id !== socket.id)
                                .map(player => (
                                    <button key={player.id} onClick={() => handleGuess(player.id)}>
                                        {player.name}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                <h2>✅ You have joined the game as {playerName}</h2>
            )}

            <h3>Players:</h3>
            <ul>
                {Object.values(players).map((player) => (
                    <li key={player.id}>
                        {player.name} {gameStarted && `(Role: ${playerRole === "Raja" ? player.role : "???"})`}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
