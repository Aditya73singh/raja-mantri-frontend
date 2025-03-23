import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://raja-mantri-backend.onrender.com"); // Update with your actual backend URL

function App() {
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState({});
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerRole, setPlayerRole] = useState("");
    const [isSipahiTurn, setIsSipahiTurn] = useState(false);
    const [roundInfo, setRoundInfo] = useState({ round: 0, totalRounds: 7 });
    const [roundResults, setRoundResults] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [finalScores, setFinalScores] = useState([]);
    
    useEffect(() => {
        socket.on("connect", () => console.log(`✅ Connected as ${socket.id}`));

        socket.on("updatePlayers", (playerList) => {
            setPlayers(playerList);
        });

        socket.on("roundStart", (info) => {
            console.log(`🔄 Round ${info.round}/${info.totalRounds} starting`);
            setRoundInfo(info);
            setRoundResults(null);
        });

        socket.on("gameStarted", (playerList) => {
            console.log("🚀 Game Started!", playerList);
            setPlayers(playerList);
            setGameStarted(true);
        });
        
        socket.on("yourRole", (role) => {
            console.log(`🎭 Your role: ${role}`);
            setPlayerRole(role);
        });

        socket.on("yourTurnToGuess", () => {
            console.log("🤔 You are the Sipahi! Guess who is the Chor.");
            setIsSipahiTurn(true);
        });

        socket.on("roundResult", ({ success, players, message }) => {
            console.log(`📣 Round result: ${message}`);
            setPlayers(players);
            setRoundResults({ success, message });
            setIsSipahiTurn(false);
        });
        
        socket.on("gameOver", ({ winner, finalScores }) => {
            console.log("🏆 Game Over!", winner);
            setGameOver(true);
            setWinner(winner);
            setFinalScores(finalScores);
            setGameStarted(false);
        });
        
        socket.on("gameCancelled", ({ message }) => {
            alert(message);
            setGameStarted(false);
            setGameOver(false);
            setRoundResults(null);
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
    
    const startNewGame = () => {
        setGameOver(false);
        setWinner(null);
        setFinalScores([]);
        setRoundResults(null);
        setRoundInfo({ round: 0, totalRounds: 7 });
        // The server will handle starting a new game when all players join again
    };

    // Render role with appropriate emoji
    const getRoleEmoji = (role) => {
        switch(role) {
            case "Raja": return "👑 Raja";
            case "Mantri": return "🧠 Mantri";
            case "Chor": return "🦹 Chor";
            case "Sipahi": return "👮 Sipahi";
            default: return "❓ Hidden";
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ color: "#4a148c" }}>𝕶𝖎𝖓𝖌 𝖒𝖎𝖓𝖎𝖘𝖙𝖊𝖗 𝕲𝖆𝖒𝖊 hbd dkji</h1>

            {!isJoined ? (
                <div style={{ margin: "40px 0", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                    <h2>Enter Your Name to Join</h2>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        style={{ padding: "10px", fontSize: "16px", marginRight: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <button 
                        onClick={handleJoin}
                        style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#6a1b9a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Join Game
                    </button>
                </div>
            ) : gameStarted ? (
                <div style={{ margin: "20px 0" }}>
                    <div style={{ backgroundColor: "#e1bee7", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                        <h2>Round {roundInfo.round} of {roundInfo.totalRounds}</h2>
                        <h3>Your Role: <span style={{ fontWeight: "bold" }}>{getRoleEmoji(playerRole)}</span></h3>
                        
                        {roundResults && (
                            <div style={{ 
                                backgroundColor: roundResults.success ? "#c8e6c9" : "#ffcdd2", 
                                padding: "15px", 
                                borderRadius: "8px",
                                margin: "15px 0" 
                            }}>
                                <h3>{roundResults.message}</h3>
                                <h4>Round Results:</h4>
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#9c27b0", color: "white" }}>
                                            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Player</th>
                                            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Role</th>
                                            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Round Points</th>
                                            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Total Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(players).map((player) => (
                                            <tr key={player.id}>
                                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{player.name}</td>
                                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{getRoleEmoji(player.role)}</td>
                                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{player.currentPoints}</td>
                                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{player.totalPoints}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {isSipahiTurn && playerRole === "Sipahi" && (
                            <div style={{ backgroundColor: "#bbdefb", padding: "15px", borderRadius: "8px", margin: "15px 0" }}>
                                <h3>👮 You are the Sipahi! Guess who is the Chor:</h3>
                                <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                                    {Object.values(players)
                                        .filter(player => player.id !== socket.id && player.role !== "Raja" && player.role !== "Sipahi")
                                        .map(player => (
                                            <button 
                                                key={player.id} 
                                                onClick={() => handleGuess(player.id)}
                                                style={{ 
                                                    padding: "10px 20px", 
                                                    fontSize: "16px", 
                                                    backgroundColor: "#2196f3", 
                                                    color: "white", 
                                                    border: "none", 
                                                    borderRadius: "4px", 
                                                    cursor: "pointer",
                                                    margin: "5px" 
                                                }}
                                            >
                                                {player.name}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <h3>Players in Game:</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
                        {Object.values(players).map((player) => (
                            <div 
                                key={player.id} 
                                style={{ 
                                    padding: "10px", 
                                    border: "1px solid #ddd", 
                                    borderRadius: "8px",
                                    backgroundColor: player.id === socket.id ? "#e8f5e9" : "white",
                                    minWidth: "150px"
                                }}
                            >
                                <div><strong>{player.name}</strong> {player.id === socket.id && "(You)"}</div>
                                <div>{player.role === "Hidden" && playerRole !== "Raja" ? "❓ Hidden" : getRoleEmoji(player.role)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : gameOver ? (
                <div style={{ margin: "20px 0", backgroundColor: "#f3e5f5", padding: "20px", borderRadius: "8px" }}>
                    <h2 style={{ color: "#4a148c" }}>🏆 Game Over!</h2>
                    <h3>Winner: {winner.name} with {winner.totalPoints} points!</h3>
                    
                    <h3>Final Scores:</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#9c27b0", color: "white" }}>
                                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Player</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {finalScores.sort((a, b) => b.totalPoints - a.totalPoints).map((player, index) => (
                                <tr key={index} style={{ backgroundColor: index === 0 ? "#f9fbe7" : "white" }}>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{player.name}</td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{player.totalPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <button 
                        onClick={startNewGame}
                        style={{ 
                            padding: "10px 20px", 
                            fontSize: "16px", 
                            backgroundColor: "#6a1b9a", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "4px", 
                            cursor: "pointer",
                            marginTop: "20px"
                        }}
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <div style={{ margin: "20px 0", backgroundColor: "#e8eaf6", padding: "15px", borderRadius: "8px" }}>
                    <h2>✅ You have joined the game as {playerName}</h2>
                    <p>Waiting for other players to join...</p>
                    <p>Players needed: {4 - Object.keys(players).length} more</p>
                </div>
            )}

            {/* Game Rules Section */}
            <div style={{ margin: "40px 0", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", textAlign: "left" }}>
                <h3 style={{ textAlign: "center" }}>Game Rules:</h3>
                <ul>
                    <li><strong>Roles & Points:</strong> Raja (800), Mantri (900), Chor (0), Sipahi (1000)</li>
                    <li><strong>Game Length:</strong> 7 rounds</li>
                    <li><strong>Hidden Roles:</strong> Only Raja and Sipahi are revealed publicly</li>
                    <li><strong>Guessing:</strong> Sipahi tries to guess who is the Chor</li>
                    <li><strong>Scoring:</strong> 
                        <ul>
                            <li>If Sipahi guesses correctly: Everyone keeps their points</li>
                            <li>If Sipahi guesses incorrectly: Chor gets Sipahi's points (1000) and Sipahi gets 0</li>
                        </ul>
                    </li>
                    <li><strong>Winner:</strong> Player with the highest total points after all rounds</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
