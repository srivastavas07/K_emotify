import { useEffect, useRef, useState } from 'react';
import "./App.css";
import SongGrid from "./components/songCards";
import * as faceapi from 'face-api.js'
import Playlist from './components/PlaylistCard';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import spotify from './Assets/spotify.json';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

function App() {

  const [searchValue, setSearchValue] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [detection, setDetection] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [displaySection, setDisplaySection] = useState("SongGrid");
  const [emotionGener, setEmotionGener] = useState("");
  const [type, setType] = useState("");
  const [user, setUser] = useState();

  const emotionGenre = {
    "happy": ["indie happy hindi", "party", "arijit singh", "indian hindi", "chill hindi"],
    "angry": ["punjabi", "fast beat", "honey singh", "bhajans","KK"],
    "surprised": ["ed sheeran", "diljit dosanjh"],
    "sad": ["sad hindi", "emotional sad hindi", "anuv jain", "kishore kumar", "classical hindi", "the local train"],
    "neutral": ["chill hindi", "old songs", "ed sheeran", "satindar sartaj"]
  };

  const videoRef = useRef()
  const canvasRef = useRef()

  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo()
    videoRef && loadModels()

  }, [])

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        videoRef.current.play();
      })
      .catch((err) => {
        console.log(err)
      })
  }
  // LOAD MODELS FROM FACE API

  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")

    ]).then(() => {
      faceMyDetect()
    })
  }

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      setDetection(detections);

      // DRAW YOUr FACE IN WEBCAM
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      })

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)


    }, 1000)
  }

  const Login = () => {

    const REDIRECT_URI = "http://localhost:3000/callback";
    const SCOPE = 'user-read-private user-read-email user-top-read user-library-read';
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURI(SCOPE)}`;
    window.location.href = AUTH_URL;
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    //GETTING THE ACCESS TOKEN AND THE REFRESH TOKEN;

    const authBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: "http://localhost:3000/callback",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: authBody.toString()
    })
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('refresh_token', data.refresh_token);
      })
      .catch(error => console.log("Error: ", error));

  };
  useEffect(() => {
    //GETTING A NEW ACCESS TOKEN ON EVERY NEW RENDER OF THE APP COMPONENT.
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      const authBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });

      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: authBody.toString()
      })
        .then(response => response.json())
        .then(data => {
          setAccessToken(data.access_token);
        })
        .catch(error => console.log("Error: ", error));
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      GetUserInfo();
    }
  }, [accessToken]);

  const GetUserInfo = async () => {

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
      });
      const data = await response.json();
      setUser(data);

    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  async function search() {
    if(!searchValue){
      toast.error("Provide query to search.")
      return;
    }
    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    const searchQuery = encodeURIComponent(searchValue); // ENCODE THE SEARCH QUERY

    fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, parameters)
      .then(response => response.json())
      .then(data => {
        // Process the data (data.tracks.items) to get the list of tracks
        setTracks(data.tracks.items);
        setDisplaySection("SongGrid");
        setType("Search Result")
      })
      .catch(error => console.error('Error:', error));
  }

  function emotionDetect() {
    if (detection.length > 0) {
      const firstDetection = detection[0];
      if (firstDetection.expressions) {
        const emotion = firstDetection.expressions;
        console.log(emotion)

        const emotionLabels = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];
        let maxEmotion = "neutral";
        let maxProbability = 0;

        emotionLabels.forEach((label) => {
          if (emotion[label] > maxProbability) {
            maxEmotion = label;
            maxProbability = emotion[label];
          }
        });
        setCurrentEmotion(maxEmotion);

      } else {
        console.log("No expressions available in the first detection.");
      }
    } else {
      console.log("No detections available.");
    }
  }
  useEffect(() => {

    setSearchValue(currentEmotion);
    console.log(currentEmotion);
    // WE NEED TO PASS THE GENRE RELATED TO EMOTION.

    if (currentEmotion) {
      const emoLength = emotionGenre[currentEmotion].length;
      const maxEmotionRandomGenre = emotionGenre[currentEmotion][Math.floor(Math.random() * emoLength)]
      setEmotionGener(maxEmotionRandomGenre);
    }

  }, [currentEmotion]);

  async function GenreSearch() {

    // WILL FETCH SONG BASED ON THE EMOTION GENRE

    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    const searchQuery = encodeURIComponent(emotionGener);

    fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&market=IN`, parameters)
      .then(response => response.json())
      .then(data => { setTracks(data.tracks.items); console.log(data.tracks) })
      .catch(error => console.error('Error:', error));
    console.log('Tracks');
    console.log(tracks);
    setDisplaySection("SongGrid");
    setType("Genre Based");

  }
  const playlistSearch = async () => {
    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    fetch(`https://api.spotify.com/v1/search?q=${encodeURI(emotionGener)}&type=track%2Cplaylist&market=IN`, parameters)
      .then(response => response.json())
      .then(data => { console.log(data.playlists.items); setPlaylist(data.playlists.items); setDisplaySection("playlist") })
      .catch(error => console.error('Error:', error));
    setType("Playlist Based");
  }

  const LikedSongs = async () => {
    setType("Like Based")
    try {

      const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
      });
      const data = await response.json();
      console.log(data)
      if (data.items) {
        setTracks(data.items);
        setDisplaySection("SongGrid");
      } else {
        toast.error('No tracks found in your library');
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };
  return (
    <div>

      {/* FIRST SECTION WHERE EMOTION RECOGNITION WILL BE DONE */}
      <section className="emotion-container emotion-container1 relative w-[100vw] pb-32 pt-10 text-white">

        {/* BUTTON AND INPUT FIELDs */}

        <div className='absolute top-2 right-2 bg-[#000000a1] backdrop-blur-md p-3 rounded-md'>
          <a
            className='flex items-center gap-2'
            href={user?.external_urls?.spotify ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className='h-8 w-8 bg-black rounded-full ' src={`https://api.dicebear.com/5.x/initials/svg?seed=${encodeURI(user?.display_name)}`} alt="user-profile" /><p className='text-sm'>{user?.display_name}</p>
          </a>
        </div>
        <div className="search flex justify-center w-[65vw] m-auto items-center mb-20 relative z-10 rounded-xl">
          <input type="text" placeholder="Search song manually or Emotion based..."
            className="input relative z-10 input-bordered w-[100%] mr-2 border-[#fff] border-2"
            onKeyPress={event => {
              if (event.key === "Enter")
                search()
            }}
            onChange={event => setSearchValue(event.target.value)}
            value={searchValue}
          />
          <button className='btn btn-outline bg-black text-white border-2'
            onClick={() => search()}>
            Search Song
          </button>
          <button className='emotionDetect btn btn-outline text-white bg-black mx-2 border-2' onClick={() => emotionDetect()}>Detect Emotion</button>
          {true && <button className='btn btn-outline' onClick={Login}>Connect<Lottie style={{ height: '40px', marginLeft:'-9px' }} animationData={spotify} /></button>}
        </div>

        {/* EMOTION CAPTURING VIDEO FIELD */}

        <div className="emotion-detection flex justify-center text-center m-auto relative z-10 ">
          <div className="appvide">
            <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
          </div>
          <canvas ref={canvasRef} width="940" height="650"
            className="appcanvas" />
        </div>

      </section>

      {/* <SpotifyPlayer
        token={accessToken}
        uris={['spotify:artist:6HQYnRM4OzToCYPpVBInuU']}
        REACT LIBRARY FOR SPOTIFY WEB APPLICATION PLAYBACK
      /> */}

      {/* SECTION FOR DISPLAYING OF SONGS */}
      <section className="emotion-container w-[100vw] bg-[#191919] py-8 text-white relative z-10">
        {tracks.length === 0 ? (<p className='text-[#b8ff5a] font-semibold text-2xl w-[100%] justify-center items-center flex gap-3'><span>FETCH SONGS TO DISPLAY.</span><span className='text-white'>Connect Spotify if not Connected</span></p>) : (
          <>
            <div className='songOptions w-[100%] flex justify-center items-center gap-3'>
              <button disabled={!currentEmotion} onClick={GenreSearch} className={`btn OptionButton genreButton  ${type === 'Genre Based' && 'OptionButtonActive'}`} aria-label={'Current Genre is ' + emotionGener}>Genre</button>
              <button disabled={!currentEmotion} onClick={playlistSearch} className={`btn OptionButton playlistButton ${type === 'Playlist Based' && 'OptionButtonActive'}`}>Playlist</button>
              <button onClick={search} className={`btn  OptionButton trackButton ${type === 'Search Result' && 'OptionButtonActive'}`}>Track</button>
              <button onClick={LikedSongs} className={`btn OptionButton albumButton ${type === 'Like Based' && 'OptionButtonActive'}`}>Liked Songs</button>

            </div>
            {
              displaySection === "playlist" ? (<Playlist type={type} playlists={playlist} />) : (<SongGrid tracks={tracks} type={type} />)
            }
          </>
        )}

      </section>
    </div>
  );
}

export default App;
