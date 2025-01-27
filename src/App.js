import React, { useState, useEffect } from "react";
import axios from "axios";

const NBABettingApp = () => {
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamesAndPlayers = async () => {
      setLoading(true);
      try {
        // Replace with actual API endpoint for NBA games
        const gamesResponse = await axios.get("https://api.sportsdata.io/v4/nba/scores/json/GamesByDate/2025-01-24", {
          headers: {
            "Ocp-Apim-Subscription-Key": "YOUR_API_KEY_HERE"
          }
        });

        setGames(gamesResponse.data);

        // Replace with actual API endpoint for player stats
        const playersResponse = await axios.get("https://api.sportsdata.io/v4/nba/stats/json/PlayerSeasonStats/2025", {
          headers: {
            "Ocp-Apim-Subscription-Key": "YOUR_API_KEY_HERE"
          }
        });

        const topPlayers = playersResponse.data
          .filter(player => player.PointsPerGame > 20) // Example filter: players averaging > 20 PPG
          .sort((a, b) => b.PointsPerGame - a.PointsPerGame) // Sort by PPG
          .slice(0, 10); // Top 10 players

        setPlayers(topPlayers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesAndPlayers();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">NBA Betting Insights</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Today's Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => (
            <div key={game.GameID}>
              <div>
                <p className="font-bold">{game.HomeTeam} vs {game.AwayTeam}</p>
                <p>{new Date(game.DateTime).toLocaleTimeString()}</p>
                <p>Venue: {game.Venue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Top Players to Watch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player.PlayerID}>
              <div>
                <p className="font-bold">{player.Name}</p>
                <p>Team: {player.Team}</p>
                <p>Points Per Game: {player.PointsPerGame}</p>
                <p>Assists Per Game: {player.AssistsPerGame}</p>
                <p>Rebounds Per Game: {player.ReboundsPerGame}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NBABettingApp;
