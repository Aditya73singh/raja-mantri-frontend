import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://raja-mantri-backend.onrender.com", {
    transports: ["websocket"],
    withCredentials: true
});

function App() {
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState({});
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerRole, setPlayerRole] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            console.log(`✅ Connected to WebSocket Server! Socket ID: ${socket.id}`);
        });

        socket.on("updatePlayers", (playerList) => {
            console.log("✅ Players Updated:", playerList);
            setPlayers(playerList);
        });

        socket.on("joinedSuccessfully", (data) => {
            console.log(`🎉 Joined Successfully as ${data.playerName}`);
            setIsJoined(true);
        });

        socket.on("gameStarted", (playerList) => {
            console.log("🚀 Game Started!", playerList);
            setPlayers(playerList);
            setGameStarted(true);

            // Set the role of the current player
            if (playerList[socket.id]) {
                setPlayerRole(playerList[socket.id].role);
            }
        });

        socket.on("gameFull", (message) => {
            alert(message);
        });

        return () => socket.disconnect();
    }, []);

    const handleJoin = () => {
        if (playerName.trim() !== "") {
            console.log("🟢 Emitting 'joinGame' event with name:", playerName);
            socket.emit("joinGame", playerName, (response) => {
                console.log("Server Response:", response);
                if (response.success) {
                    setIsJoined(true);
                } else {
                    alert(response.message);
                }
            });
        } else {
            alert("❌ Please enter a valid name!");
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
                </div>
            ) : (
                <h2>✅ You have joined the game as {playerName}</h2>
            )}

            <h3>Players:</h3>
            <ul>
                {Object.values(players).map((player) => (
                    <li key={player.id}>
                        {player.name} {gameStarted && `(Role: ${player.role})`}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
