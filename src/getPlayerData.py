import sys
import json
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
import requests
import json
import time
from requests.exceptions import RequestException
from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import pandas as pd

def fetch_nba_stats():
    url = "http://localhost:3001/nba-stats"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return {}
    
# def process_players_for_game(game):
#     # List to store player data for the game
#     player_data = []  
    
#     # Process home team players
#     if "homeTeam" in game and "players" in game["homeTeam"]:
#         for p in game["homeTeam"]["players"]:
#             if p.get("rosterStatus") == "Active":
#                 first_name = p.get("firstName", "")
#                 last_name = p.get("lastName", "")
#                 full_name = f"{first_name} {last_name}".strip()

#                 player = get_player_by_name(first_name, last_name)
#                 if player:
#                     player_id = player.get('id')
#                     if player_id:
#                         last_5_games = get_player_stats(player_id)
#                         ppg = last_5_games['PTS'].mean()
#                         apg = last_5_games['AST'].mean()
#                         rpg = last_5_games['REB'].mean()

#                         # Append home team player data
#                         player_data.append({
#                             'Game ID': game.get('gameId'),
#                             'Team': "Home",
#                             'Player Name': full_name,
#                             'PPG': ppg,
#                             'APG': apg,
#                             'RPG': rpg
#                         })
#                     else:
#                         print(f"Missing player ID for {full_name}")
#                 else:
#                     print(f"Player {full_name} not found.")
    
#     # Process away team players
#     if "awayTeam" in game and "players" in game["awayTeam"]:
#         for p in game["awayTeam"]["players"]:
#             if p.get("rosterStatus") == "Active":
#                 first_name = p.get("firstName", "")
#                 last_name = p.get("lastName", "")
#                 full_name = f"{first_name} {last_name}".strip()

#                 player = get_player_by_name(first_name, last_name)
#                 if player:
#                     player_id = player.get('id')
#                     if player_id:
#                         last_5_games = get_player_stats(player_id)
#                         ppg = last_5_games['PTS'].mean()
#                         apg = last_5_games['AST'].mean()
#                         rpg = last_5_games['REB'].mean()

#                         # Append away team player data
#                         player_data.append({
#                             'Game ID': game.get('gameId'),
#                             'Team': "Away",
#                             'Player Name': full_name,
#                             'PPG': ppg,
#                             'APG': apg,
#                             'RPG': rpg
#                         })
#                     else:
#                         print(f"Missing player ID for {full_name}")
#                 else:
#                     print(f"Player {full_name} not found.")
    
#     # Convert the list of player data into a pandas DataFrame
#     player_df = pd.DataFrame(player_data)
    
#     return player_df

# def process_nba_data(data):
#     if not data or "games" not in data:
#         print("No data received.")
#         return
    
#     games_with_active_players = data["games"]
#     all_games_data = []  # List to store player data for all games
    
#     # Process each game
#     c = 0
#     for game in games_with_active_players:
#         if c == 0:
#             game_data = process_players_for_game(game)  # Get player data for the game
#         all_games_data.append(game_data)
#         c = c + 1
    
#     # Concatenate data from all games into a single DataFrame
#     final_df = pd.concat(all_games_data, ignore_index=True)
    
#     return final_df



    
def process_nba_data(data):
    if not data or "games" not in data:
        print("No data received.")
        return
    
    games_with_active_players = data["games"]
    # print(games_with_active_players[0])
    for game in games_with_active_players:
        game["homeTeamActivePlayers"] = []
        game["awayTeamActivePlayers"] = []

        if "homeTeam" in game and "players" in game["homeTeam"]:
            process_players(game["homeTeam"], isHomeTeam=True)
        if "awayTeam" in game and "players" in game["awayTeam"]:
            process_players(game["awayTeam"], isHomeTeam=False)

def process_players(team, isHomeTeam):
    # teamName = team.get("teamAbbreviation")    
    player_data = []  # List to store player data
    count = 0
    for p in team.get("players", []):
        if p.get("rosterStatus") == "Active":
            first_name = p.get("firstName", "")
            last_name = p.get("lastName", "")
            full_name = f"{first_name} {last_name}".strip()

            player = get_player_by_name(first_name, last_name)
            if player:
                player_id = player.get('id')
                if player_id:
                    last_5_games = get_player_stats(player_id)
                    # Calculate PPG, APG, RPG
                    ppg = last_5_games['PTS'].mean()
                    apg = last_5_games['AST'].mean()
                    rpg = last_5_games['REB'].mean()
                    
                    # Append data to player_data list
                    player_data.append({
                        'Player Name': full_name,
                        'PPG': ppg,
                        'APG': apg,
                        'RPG': rpg
                    })
                else:
                    print(f"Missing player ID for {full_name}")
            else:
                print(f"Player {full_name} not found.")
                
            count += 1
            if count >= 5:
                break
    player_df = pd.DataFrame(player_data)

    top_ppg = player_df.nlargest(3, 'PPG')[['Player Name', 'PPG']]  # Drop APG, RPG
    top_apg = player_df.nlargest(3, 'APG')[['Player Name', 'APG']]  # Drop PPG, RPG
    top_rpg = player_df.nlargest(3, 'RPG')[['Player Name', 'RPG']]    

    print(top_ppg)
    print(top_apg)
    print(top_rpg)

    # return player_df

def get_player_by_name(first_name, last_name):
    # Search for the player by first and last name
    player_list = players.get_players()
    for player in player_list:
        if player['first_name'].lower() == first_name.lower() and player['last_name'].lower() == last_name.lower():
            return player
    return None

def get_player_stats(player_id):
    time.sleep(0.5)  # Rate Limiting
    game_log = playergamelog.PlayerGameLog(player_id=player_id, season='2024-25', season_type_all_star='Regular Season')
    df = game_log.get_data_frames()[0]
    # Take last 15 games
    return df.head(15)

if __name__ == "__main__":
    nbaData = fetch_nba_stats()
    process_nba_data(nbaData)

    # just need to combine them for one game ... 
    # then we have ppg, apg, and rpg leaders per game 


    # now i look into betting lines ... 
    # and per player calculate their line and the ones i found, and find an interesting difference
    # factor in different events ... "training"
    # then feed in the stats, the lines, and the events, and make gpt make a decision and spit it out 


    # i have x amount of games in season 
    # I can make player comparisons and get their games against the current team being played and see how they did ... or maybe just positions
    # but only need to do this for the players being selected here

    # do the stocks thing to get an idea 








# need to look into getting access to all the books and stuff .... 

# look into recent games and all stats and make a good hypothesis for a good choice 




# once we have an optimal choice (something worth betting on)
# a list of 5-6 things that are worth betting on based off of lines etc ... 

# we can do some sort of training, I can take a look at 
# throughout this season ... when has this guy scored above this line and below this line
# what factors drove this ... 
# 22, 24, 27, 29 home away etc ... 
# compare it with all sorts of things and use opponent skill as a negative weight along with distance travelled and back to backs 






# def get_player_season_stats(player_id):
#     retries = 0
#     while retries < 3:
#         try:
#             player_career_stats = playercareerstats.PlayerCareerStats(player_id, timeout=0.6)
#             if player_career_stats:
#                 career_stats_df = player_career_stats.get_data_frames()[0]
#                 season_stats = career_stats_df.tail(1).copy()

#                 if 'GP' in season_stats.columns and season_stats['GP'].iloc[0] > 0:
#                     season_stats['PPG'] = season_stats['PTS'] / season_stats['GP']
#                     season_stats['RPG'] = season_stats['REB'] / season_stats['GP']
#                     season_stats['APG'] = season_stats['AST'] / season_stats['GP']
#                     season_stats['STL_PG'] = season_stats['STL'] / season_stats['GP']
#                     season_stats['BLK_PG'] = season_stats['BLK'] / season_stats['GP']
#                     season_stats['PF_PG'] = season_stats['PF'] / season_stats['GP']

#                     stats_df = season_stats[['PPG', 'RPG', 'APG']]
#                     return stats_df
            
#             print(f"Player ID {player_id} has no valid season stats.")
#             return None

#         except RequestException as e:
#             print(f"Network error fetching stats for player ID {player_id}: {e}")
#         except Exception as e:
#             print(f"Unexpected error fetching stats for player ID {player_id}: {e}")

#         retries += 1
#         time.sleep(2)  # Wait 2 seconds before retrying

#     print(f"Failed to fetch stats for player ID {player_id} after {3} retries.")
#     return None