import { useEffect, useRef, useState } from 'react';
import "./App.css";
import SongGrid from "./components/songCards";
import * as faceapi from 'face-api.js'
import Playlist from './components/PlaylistCard';



const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

function App() {

  const [searchValue, setSearchValue] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [detection, setDetection] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [displaySection , setDisplaySection] = useState("SongGrid");
  const [emotionGener, setEmotionGener] = useState("");

  const emotionGenre = {
    "happy": ["acoustic", "disco", "funk", "salsa","indian","chill"],
    "angry": ["death-metal", "hard-rock", "metal", "punk"],
    "surprised": ["anime", "chill", "comedy", "disney"],
    "sad": ["blues", "country", "folk", "gospel", "jazz","indie","classical"]
  };

  const videoRef = useRef()
  const canvasRef = useRef()

  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo()
    videoRef && loadModels()

  },[])

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
        height:650,
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)


    }, 1000)
  }


  useEffect(() => {
    // Access the api access token
    var authParameters = {
      method: "POST",
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&scope=user-library-read user-library-modify user-modify-playback-state'

    }
    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then(response => response.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => console.log(error))

  }, [])

  async function search() {
    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    const searchQuery = encodeURIComponent(searchValue); // Encode the search query

    fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, parameters)
      .then(response => response.json())
      .then(data => {
        // Process the data (data.tracks.items) to get the list of tracks
        setTracks(data.tracks.items);
        setDisplaySection("SongGrid");
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
  useEffect(()=>{
    setSearchValue(currentEmotion)
  },[currentEmotion]);

  async function GenreSearch() {
    // we need to pass the genre associated to that emotion 
    console.log('This is the Current Emotion'+currentEmotion);
    const emoLength = emotionGenre[currentEmotion].length;
    const maxEmotionRandomGenre = emotionGenre[currentEmotion][Math.floor(Math.random() * emoLength)]
    setEmotionGener(maxEmotionRandomGenre);
    console.log('Genre for the Emotion  '+ emotionGener)
    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    // const searchQuery = encodeURIComponent(currentEmotion); // Encode the search query
    const searchQuery = encodeURIComponent(emotionGener); // Encode the search query
    fetch(`https://api.spotify.com/v1/search?q=genre:${searchQuery}&type=track`,parameters)
    // fetch('https://api.spotify.com/v1/search?query=genre%3Achill&type=track&locale=hi-IN', parameters)
      .then(response => response.json())
      .then(data => { setTracks(data.tracks.items); console.log(data.tracks) })
      .catch(error => console.error('Error:', error));
    console.log('Tracks');
    console.log(tracks);
    setDisplaySection("SongGrid");

  }
  const playlistSearch = () => {
    //some issue here regarding data fetch..
    const genre = 'jazz';
    const country = 'US';
    const locale = 'hi_IN';
    const limit = '50';
    const parameters = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    };
    fetch(`https://api.spotify.com/v1/browse/featured-playlists?limit=${limit}&country=${country}&locale=${locale}&timestamp=2023-09-15T15%3A07%3A33&genre=${genre}`, parameters)
    .then(response => response.json())
    .then(data => {console.log(data.playlists.items); setPlaylist(data.playlists.items) ; setDisplaySection("playlist") })
    .catch(error => console.error('Error:', error));
  }
  const albumSearch =()=> {
    console.log('Album Search');
    return
  }


  return (
    <>

      {/* First Section Where FaceRecognition Will be done */}

      <section className="emotion-container emotion-container1 relative w-[100vw] pb-32 pt-10 text-white">
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
          <button className='emotionDetect btn btn-outline text-white bg-black mx-2 border-2' onClick={()=> emotionDetect()}>Detect Emotion</button>
        </div>

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




      {/* Second Section */}
      {/* "https://api.spotify.com/v1/search?query=genre%3Achill&type=track&locale=en-GB%2Cen-US%3Bq%3D0.9%2Cen%3Bq%3D0.8&offset=0&limit=20" */}
      {/* https://api.spotify.com/v1/search?query=genre%3Achill&type=track&locale=hi-IN%3Bq%3D0.9 */}

      <section className="emotion-container w-[100vw] py-8 bg-slate-400 text-white relative z-10">
        {tracks.length === 0 ? (<p className='text-black font-semibold text-2xl w-[100%] text-center'>No Data available...!!</p>) : (
          <>
            <div className='songOptions w-[100%] flex justify-center items-center gap-3'>
              <button onClick={GenreSearch} className='btn OptionButton genreButton' aria-label = {'Current Genre is ' + emotionGener}>Genre</button>
              {/* <button onClick={albumSearch} className = 'btn OptionButton albumButton'>Album</button> */}
              <button onClick={playlistSearch} className = 'btn OptionButton playlistButton'>Playlist</button>
              <button onClick={search} className='btn OptionButton trackButton'>Track</button>

            </div>
          {
            displaySection === "playlist" ? (<Playlist playlists = {playlist}/>):(<SongGrid tracks={tracks}/>)
          }
          </>
        )}

      </section>
    </>
  );
}

export default App;
