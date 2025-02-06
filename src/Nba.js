import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';
import nbaLogo from './assets/nbalogo.png';

const NBAInsights = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGamesAndPlayers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/nba-stats");
        const data = response.data;

        const gamesWithActivePlayers = data.games.map((game) => ({
          ...game,
          homeTeamActivePlayers: game.homeTeam.players.filter(
            (player) => player.rosterStatus === "Active"
          ),
          awayTeamActivePlayers: game.awayTeam.players.filter(
            (player) => player.rosterStatus === "Active"
          ),
        }));

        setGames(gamesWithActivePlayers);
      } catch (error) {
        console.error("Error fetching games and players:", error);
      }
    };

    fetchGamesAndPlayers();
  }, []);

  return (
    <div className="nba-insights-container">
      <div className="logo-container">
        <img src={nbaLogo} alt="NBA Logo" className="nba-logo" />
      </div>
      <h1 className="title">Today's NBA Games and Players</h1>
      <div className="games-list">
        {games.map((game, index) => (
          <div className="game-card" key={index}>
            <div className="game-header">
              <div className="team-name">{game.homeTeam.teamAbbreviation}</div>
              <div className="vs">vs</div>
              <div className="team-name">{game.awayTeam.teamAbbreviation}</div>
            </div>
            <div className="players-container">
              <div className="team-players home-team">
                <h3>Home Team</h3>
                <div className="player-list">
                  {game.homeTeamActivePlayers.length > 0 ? (
                    game.homeTeamActivePlayers.map((player) => (
                      <div key={player.id} className="player-badge">
                        {player.firstName} {player.lastName}
                      </div>
                    ))
                  ) : (
                    <p>No active players</p>
                  )}
                </div>
              </div>
  
              <div className="team-players away-team">
                <h3>Away Team</h3>
                <div className="player-list">
                  {game.awayTeamActivePlayers.length > 0 ? (
                    game.awayTeamActivePlayers.map((player) => (
                      <div key={player.id} className="player-badge">
                        {player.firstName} {player.lastName}
                      </div>
                    ))
                  ) : (
                    <p>No active players</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );  
};

export default NBAInsights;