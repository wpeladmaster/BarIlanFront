import React, { useState } from 'react';
import VideosListItems from '../ListItems/VideosListItems';

const VideosList = ({
  groupedVideos,
  onClickFromAdminVideo,
  onClickFromHomeVideo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filterVideos = () => {
    // Add filtering logic based on search term and date
    return Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => {
      // Filtering logic
      return {
        sessionName,
        videos: sessionVideos.filter((video) => true), // Update condition
      };
    });
  };

  const filteredVideos = filterVideos();

  const handleVideoClick = (video) => {
    // Update modal states here
    console.log('Video clicked:', video);
  };

  return (
    <div>
      <div>Search bar logic</div>
      <ul>
        {filteredVideos.map(({ sessionName, videos }) => (
          <li key={sessionName}>
            <h3>{sessionName}</h3>
            <VideosListItems videos={videos} onVideoClick={handleVideoClick} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideosList;
