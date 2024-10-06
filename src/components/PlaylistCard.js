import React from 'react';
import spotify from '../Assets/spotify.json';
import Lottie from 'lottie-react';

function PlaylistCard({ playlist }) {
    
    const { name, external_urls, description, images } = playlist;

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 text-black">
            <div className='trun'>
                <h2 className="text-xl font-semibold">{name}</h2>
            </div>
            <p className="text-gray-600 trun">{description}</p>
            <img src={images[0].url} alt={name} className="mt-4 w-full" />
            <button className="mt-4 bg-black hover:bg-blue-700 text-white py-2 px-4 rounded-xl"><a href={external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center">
                    Play on <Lottie style={{ height: '45px', padding: '0px 0px 0px 10px' }} animationData={spotify} />
                </span>
            </a></button>
        </div>
    );
}

export default function Playlist({ playlists, type }) {

    return (
        <div className="container mx-auto p-6">
            <h1 className="dHeading font-bold mb-4 pb-8">{type}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist, index) => (
                    <PlaylistCard key={index} playlist={playlist} />
                ))}
            </div>
        </div>
    )
}

