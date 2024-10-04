import React from 'react';
import Lottie from 'lottie-react';
import spotify from '../Assets/spotify.json';




function SongCard({ track }) {
    const { name, artists, album, id } = track;
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 text-black">
            <div className='trun'>
                <h2 className="text-xl font-semibold">{name}</h2>
            </div>
            <p className="text-gray-600">{artists[0].name}</p>
            <img src={album.images[0].url} alt={name} className="mt-4 w-full" />
            <button className="mt-4 bg-black hover:bg-blue-700 text-white py-2 px-4 rounded-xl"><a href={`https://open.spotify.com/track/${id}`} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center font-bold">
                Play on
                <Lottie style={{height:'45px', padding:'0px 0px 0px 10px'}} animationData={spotify}/>
                    
                </span>
            </a></button>
        </div>
    );
}

function SongGrid({ tracks }) {
    //this is how you access data by destructuring it
    // console.log(tracks)
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl text-black font-bold mb-4 pb-8">Song's Library</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map((track, index) => (
                    <SongCard key={index} track={track} />
                ))}
            </div>
        </div>
    );
}

export default SongGrid;