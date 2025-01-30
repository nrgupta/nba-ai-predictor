import React, { useState, useEffect } from "react";
import { BalldontlieAPI } from "@balldontlie/sdk";

const NBABettingApp = () => {
  const [games, setGames] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const api = new BalldontlieAPI({ apiKey: "dae8ef55-6309-4191-aefc-29dc0ac60023" });
  debugger;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        debugger;
        const today = new Date().toISOString().split("T")[0];  // Get today's date
        const response = await api.nba.getGames({
          start_date: today,
          end_date: today,
        });

        setGames(response.data);  // Set games data
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const playersData = [];

        for (let game of games) {
          // Fetch the team details using team IDs from game

          debugger;
          const team1 = await api.nba.getTeam(game.home_team.id);
          const team2 = await api.nba.getTeam(game.visitor_team.id);

          // Fetch players for each team (assuming you have the `id`)
          const team1Players = await api.nba.getPlayers({ team_id: team1.data.id });
          const team2Players = await api.nba.getPlayers({ team_id: team2.data.id });

          // Collect top players (you can adjust this logic to choose top players based on specific criteria)
          playersData.push({
            team1: {
              name: team1.data.name,
              topPlayers: team1Players.data.slice(0, 3),
            },
            team2: {
              name: team2.data.name,
              topPlayers: team2Players.data.slice(0, 3),
            },
          });
        }

        setTopPlayers(playersData);
      } catch (error) {
        console.error("Error fetching top players:", error);
      }
    };

    if (games.length > 0) {
      fetchTopPlayers();
    }
  }, [games]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-500">NBA Betting Insights</h1>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Today's Games</h2>
        {games.length > 0 ? (
          games.map((game, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <div className="flex justify-between items-center">
                <p className="text-xl font-medium">{game.home_team.full_name}</p>
                <span className="text-lg font-bold text-gray-300">VS</span>
                <p className="text-xl font-medium">{game.visitor_team.full_name}</p>
              </div>
              <p className="mt-2 text-gray-400">Game Time: {game.date}</p>
            </div>
          ))
        ) : (
          <p>No games scheduled for today.</p>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Top Players</h2>
        {topPlayers.length > 0 ? (
          topPlayers.map((game, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">
                {game.team1.name} vs {game.team2.name}
              </h3>

              <div className="flex justify-between">
                <div className="w-1/2 pr-2">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">{game.team1.name} Top Players:</h4>
                  <ul className="space-y-2">
                    {game.team1.topPlayers.map((player) => (
                      <li key={player.id} className="text-gray-300">
                        {player.first_name} {player.last_name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-1/2 pl-2">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">{game.team2.name} Top Players:</h4>
                  <ul className="space-y-2">
                    {game.team2.topPlayers.map((player) => (
                      <li key={player.id} className="text-gray-300">
                        {player.first_name} {player.last_name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No top players data available.</p>
        )}
      </div>
    </div>
  );
};

export default NBABettingApp;
