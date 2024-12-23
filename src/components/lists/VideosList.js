// VideosList.js
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
    return Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => {
      return {
        sessionName,
        videos: sessionVideos.filter((video) => {
          const matchesSearch = video.fullVideoName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesDate =
            (!dateFrom || new Date(video.date) >= new Date(dateFrom)) &&
            (!dateTo || new Date(video.date) <= new Date(dateTo));
          return matchesSearch && matchesDate;
        }),
      };
    });
  };

  const filteredVideos = filterVideos();

  const handleVideoClick = (video) => {
    if (onClickFromAdminVideo) {
      onClickFromAdminVideo(video);
    } else if (onClickFromHomeVideo) {
      onClickFromHomeVideo(video);
    }
  };

  return (
    <div className="videos-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by video name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      <ul className="sessions-list">
        {filteredVideos.map(({ sessionName, videos }) => (
          <li key={sessionName} className="session-item">
            <h3 className="session-title">{sessionName}</h3>
            <VideosListItems videos={videos} onVideoClick={handleVideoClick} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideosList;
