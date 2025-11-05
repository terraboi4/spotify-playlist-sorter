# Spotify Playlist Sorter

Sort your Spotify playlists by BPM to create better playlists for the Spotify Mix feature, or just organize your music.

## Features

- Fetch any public Spotify playlist
- Display BPM (tempo) for each track
- Sort playlist by BPM (low to high)
- Clean, responsive interface

## Tech Stack

- Next.js 16
- TypeScript
- Spotify API
- Tailwind CSS

## How to Use

1. Copy a Spotify playlist link
2. Paste it into the input field
3. Click Submit to load the playlist
4. Click Sort to reorder by BPM

## Setup (for developers)

1. Clone the repo
2. `npm install`
3. Create `.env.local` with:
   - `NEXT_PUBLIC_CLIENT_ID=your_spotify_client_id`
   - `NEXT_PUBLIC_CLIENT_SECRET=your_spotify_client_secret`
4. `npm run dev`

## Future Ideas

- Sort by other audio features (energy, danceability)
- Reverse sort option
- Save sorted playlist back to Spotify
- Visualize playlist as "clouds" grouped by similar features

## Built in 2 Days

This was a 2-day challenge project to get back into coding after a 6-month break.

**Day 1:** Spotify API integration, basic playlist display  
**Day 2:** BPM fetching, sorting functionality, UI polish, shipped
