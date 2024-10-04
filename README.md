# kEmotify: Emotion based listening 🎶😊

## Introduction
Emotify is a web application that combines facial emotion recognition with Spotify API integration to provide a unique music experience. By detecting your emotions in real-time, Emotify helps you explore music that resonates with your feelings. 💖

## Features
- **Detect Your Emotion**: Use your webcam to identify your dominant emotion in real-time. 😄😢😠
- **Emotion-Based Music Search**: Based on your detected emotion, explore curated playlists or genre-specific music suggestions. 🎧
- **Manual Search Integration**: You can still search for music manually by artist, song title, or keywords. 🔍

## Technology Stack
- **React.js**: For building the user interface. ⚛️
- **face-api.js**: For facial emotion recognition. 🤖
- **Spotify API**: For music search and playback. 🎵

## Getting Started
1. Clone this repository:
    ```bash
    git clone https://github.com/yourusername/emotify.git
    cd emotify
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    REACT_APP_CLIENT_ID=Your Spotify Client ID
    REACT_APP_CLIENT_SECRET=Your Spotify Client Secret
    ```

## How It Works
- The application accesses your webcam to detect your facial expressions. 📷
- It identifies your dominant emotion (e.g., happy, sad, angry). 😌
- Based on your emotion, it offers suggestions:
  - Genre-based music recommendations. 🎶
  - Curated playlists aligned with your emotional state. 📋
- You can also search for music manually using the provided search bar. 🖊️

## Future Development
- Enhance emotion recognition accuracy. 🔧
- Implement song playback functionality. 🎤
- Expand music recommendation options. 📈

## Screenshot
- ![SS](./preview/kemotify_landing_page.png)

## Contributors
- [Kunal Chandra](https://github.com/srivastavas07) 👤
