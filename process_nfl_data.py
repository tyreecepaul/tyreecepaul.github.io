#!/usr/bin/env python3
"""
NFL Tracking Data Processor
Converts NFL Big Data Bowl CSV files to JSON format for web visualization
"""

import pandas as pd
import json
import sys
from pathlib import Path

def load_play_data(input_csv, output_csv, game_id, play_id):
    """
    Load and process a specific play from the NFL tracking data
    
    Args:
        input_csv: Path to input CSV file
        output_csv: Path to output CSV file
        game_id: Game ID to filter
        play_id: Play ID to filter
    
    Returns:
        dict: Processed play data ready for JSON export
    """
    # Load data
    print(f"Loading input data from {input_csv}...")
    df_in = pd.read_csv(input_csv)
    
    print(f"Loading output data from {output_csv}...")
    df_out = pd.read_csv(output_csv)
    
    # Filter for specific play
    play_in = df_in[(df_in['game_id'] == game_id) & (df_in['play_id'] == play_id)].copy()
    play_out = df_out[(df_out['game_id'] == game_id) & (df_out['play_id'] == play_id)].copy()
    
    if play_in.empty:
        raise ValueError(f"No data found for game_id={game_id}, play_id={play_id}")
    
    print(f"Found {len(play_in)} input frames and {len(play_out)} output frames")
    
    # Get play metadata
    play_direction = play_in['play_direction'].iloc[0]
    ball_land_x = play_in['ball_land_x'].iloc[0]
    ball_land_y = play_in['ball_land_y'].iloc[0]
    line_of_scrimmage = play_in['absolute_yardline_number'].iloc[0]
    num_frames_output = play_in['num_frames_output'].iloc[0]
    
    # Process players
    players = []
    for nfl_id in play_in['nfl_id'].unique():
        player_data = play_in[play_in['nfl_id'] == nfl_id].sort_values('frame_id')
        
        if player_data.empty:
            continue
        
        # Get player info
        player_info = player_data.iloc[0]
        player_name = player_info['player_name']
        player_role = player_info['player_role']
        player_position = player_info['player_position']
        
        # Build trajectory from input frames
        trajectory = []
        for _, row in player_data.iterrows():
            trajectory.append({
                'frame': int(row['frame_id']),
                'x': float(row['x']),
                'y': float(row['y']),
                's': float(row['s']) if pd.notna(row['s']) else 0,  # speed
                'a': float(row['a']) if pd.notna(row['a']) else 0,  # acceleration
                'dir': float(row['dir']) if pd.notna(row['dir']) else 0,  # direction
                'o': float(row['o']) if pd.notna(row['o']) else 0  # orientation
            })
        
        # Add output frames if they exist
        player_output = play_out[play_out['nfl_id'] == nfl_id].sort_values('frame_id')
        for _, row in player_output.iterrows():
            trajectory.append({
                'frame': int(row['frame_id']) + len(player_data),
                'x': float(row['x']),
                'y': float(row['y']),
                's': 0,
                'a': 0,
                'dir': 0,
                'o': 0
            })
        
        players.append({
            'nfl_id': str(nfl_id),
            'name': player_name,
            'position': player_position,
            'role': player_role,
            'trajectory': trajectory
        })
    
    # Build final play data structure
    play_data = {
        'game_id': str(game_id),
        'play_id': int(play_id),
        'play_direction': play_direction,
        'line_of_scrimmage': float(line_of_scrimmage),
        'ball_land_x': float(ball_land_x),
        'ball_land_y': float(ball_land_y),
        'num_input_frames': int(play_in['frame_id'].max()),
        'num_output_frames': int(num_frames_output),
        'total_frames': int(play_in['frame_id'].max()) + int(num_frames_output),
        'players': players
    }
    
    return play_data


def get_available_plays(input_csv, limit=10):
    """Get a list of available plays in the dataset"""
    df = pd.read_csv(input_csv)
    plays = df.groupby(['game_id', 'play_id']).size().reset_index(name='frames')
    plays = plays.head(limit)
    return plays.to_dict('records')


def main():
    # Paths to data files
    input_csv = "/home/anubis/Work/NFL2026/train/input_2023_w02.csv"
    output_csv = "/home/anubis/Work/NFL2026/train/output_2023_w02.csv"
    
    # Check if files exist
    if not Path(input_csv).exists():
        print(f"Error: Input file not found: {input_csv}")
        sys.exit(1)
    
    if not Path(output_csv).exists():
        print(f"Error: Output file not found: {output_csv}")
        sys.exit(1)
    
    # Get available plays
    print("\nFinding available plays...")
    available_plays = get_available_plays(input_csv, limit=5)
    print(f"\nFound {len(available_plays)} plays:")
    for i, play in enumerate(available_plays):
        print(f"  {i+1}. Game {play['game_id']}, Play {play['play_id']} ({play['frames']} frames)")
    
    # Process first play as example
    first_play = available_plays[0]
    game_id = first_play['game_id']
    play_id = first_play['play_id']
    
    print(f"\nProcessing Game {game_id}, Play {play_id}...")
    play_data = load_play_data(input_csv, output_csv, game_id, play_id)
    
    # Save to JSON
    output_dir = Path("/home/anubis/Work/tyreecepaul.github.io/data")
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / f"nfl_play_{game_id}_{play_id}.json"
    print(f"\nSaving to {output_file}...")
    
    with open(output_file, 'w') as f:
        json.dump(play_data, f, indent=2)
    
    print(f"✓ Successfully saved play data!")
    print(f"  - Game: {play_data['game_id']}")
    print(f"  - Play: {play_data['play_id']}")
    print(f"  - Players: {len(play_data['players'])}")
    print(f"  - Total Frames: {play_data['total_frames']}")
    print(f"  - Ball Landing: ({play_data['ball_land_x']:.2f}, {play_data['ball_land_y']:.2f})")
    
    # Process multiple plays for variety
    print("\n" + "="*60)
    print("Processing multiple plays for showcase...")
    print("="*60)
    
    # Get more plays for better variety
    all_available_plays = get_available_plays(input_csv, limit=10)
    
    all_plays = []
    for i, play_info in enumerate(all_available_plays[:5]):  # Process first 5 plays
        try:
            print(f"\nProcessing play {i+1}/5...")
            play_data = load_play_data(
                input_csv, 
                output_csv, 
                play_info['game_id'], 
                play_info['play_id']
            )
            all_plays.append(play_data)
        except Exception as e:
            print(f"  Warning: Failed to process play {play_info['play_id']}: {e}")
            continue
    
    # Save collection
    collection_file = output_dir / "nfl_plays_collection.json"
    print(f"\nSaving collection to {collection_file}...")
    
    with open(collection_file, 'w') as f:
        json.dump({
            'plays': all_plays,
            'metadata': {
                'source': 'NFL Big Data Bowl 2026',
                'week': 'Week 2, 2023',
                'num_plays': len(all_plays)
            }
        }, f, indent=2)
    
    print(f"\n✓ Successfully created plays collection with {len(all_plays)} plays!")
    print(f"\nFiles created:")
    print(f"  - {output_file}")
    print(f"  - {collection_file}")
    print(f"\nYou can now use these JSON files in your web visualization!")


if __name__ == "__main__":
    main()
