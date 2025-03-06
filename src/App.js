import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://your-backend-url.onrender.com"); // Replace with your backend URL

function App() {
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState({});
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        socket.on("updatePlayers", (playerList) => {
            console.log("✅ Players Updated:", playerList);
            setPlayers(playerList);
        });

        socket.on("joinedSuccessfully", (data) => {
            console.log(`🎉 Joined Successfully as ${data.playerName}`);
            setIsJoined(true);
        });

        socket.on("gameFull", (message) => {
            alert(message);
        });

        return () => socket.disconnect();
    }, []);

  const handleJoin = () => {
    if (playerName.trim() !== "") {
        console.log("🟢 Emitting 'joinGame' event with name:", playerName);
        socket.emit("joinGame", playerName);
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
            ) : (
                <h2>✅ You have joined the game as {playerName}</h2>
            )}

            <h3>Players:</h3>
            <ul>
                {Object.values(players).map((player) => (
                    <li key={player.id}>{player.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
