import React from 'react';
import Lottie from 'lottie-react';
import spotify from '../Assets/spotify.json';




function SongCard({ track }) {
    const { name, artists, album, id } = track;
    
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 text-black">
            <div className='trun'>
                <h2 className="text-xl font-semibold">{name ? name : "Not available"}</h2>
            </div>
            <p className="text-gray-600">{artists[0]?.name ? artists[0].name : "Not available"}</p>
            <img src={album?.images[0]?.url ? album?.images[0]?.url : "https://cdn3.vectorstock.com/i/1000x1000/37/32/404-error-page-not-found-vinyl-music-broken-vector-26853732.jpg"} alt={name} className="mt-4 w-full" onError={
                (e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdn3.vectorstock.com/i/1000x1000/37/32/404-error-page-not-found-vinyl-music-broken-vector-26853732.jpg";
                }
            }/>
            <button className="mt-4 bg-black hover:bg-blue-700 text-white py-2 px-4 rounded-xl"><a href={`https://open.spotify.com/track/${id}`} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center font-bold">
                    Play on
                    <Lottie style={{ height: '45px', padding: '0px 0px 0px 10px' }} animationData={spotify} />
                </span>
            </a></button>
        </div>
    );
}

function SongGrid({ tracks, type }) {
    const likeTracks = tracks[0].added_at;
    //This is how you access data by destructuring it
    return (
        <div className="container mx-auto p-6">
            <h1 className="dHeading font-bold mb-4 pb-8">{likeTracks ? "Liked Songs" : type}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map((track, index) => 
                {
                   track =  likeTracks ? track.track : track;
                    return(
                    <SongCard key={index} track={track} />
                )})}
            </div>
        </div>
    );
}

export default SongGrid;