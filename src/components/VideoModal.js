import React, { useEffect } from 'react';

const VideoModal = ({
  selectedVideo,
  setSelectedVideo,
  groupedVideos,
  selectedSession,
  setSelectedSession,
  activeTab,
  setActiveTab,
  handleTimeUpdate,
}) => {

  useEffect(() => {
    if (selectedVideo && selectedVideo.sessionName) {
      setSelectedSession(selectedVideo.sessionName);
      setActiveTab(selectedVideo.fullVideoName);
    } else {
      console.warn("selectedVideo or sessionName is invalid:", selectedVideo);
    }
  }, [selectedVideo, setSelectedSession, setActiveTab]);

  // Return null if no video is selected
  if (!selectedVideo) return null;

  // Handle tab changes for switching videos
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setSelectedVideo(null)}>
          &times;
        </span>
        <div className="tabs">
          {groupedVideos[selectedSession]?.map((video) => (
            <button
              key={video.fileKey}
              className={`tab-button ${video.fullVideoName === activeTab ? 'active' : ''}`}
              onClick={() => handleTabChange(video.fullVideoName)}
            >
              {video.fullVideoName}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {groupedVideos[selectedSession]?.map((video) =>
            video.fullVideoName === activeTab ? (
              <div key={video.fileKey} className="video-container">
                <video
                  width="560"
                  height="315"
                  src={video.s3Url}
                  controls
                  onTimeUpdate={(e) =>
                    handleTimeUpdate(video.fileKey, e.target.currentTime)
                  }
                ></video>
                <div className="video-details">
                  <h4>Session Details:</h4>
                  <div className="lists-wrapper">
                    <dl>
                      <div className="detail">
                        <dt>Unique Session Name:</dt>
                        <dd>{video.uniqueSessionName}</dd>
                      </div>
                      <div className="detail">
                        <dt>Camera:</dt>
                        <dd>{video.cameraName}</dd>
                      </div>
                      <div className="detail">
                        <dt>Meeting Number:</dt>
                        <dd>{video.meetingNum}</dd>
                      </div>
                      <div className="detail">
                        <dt>Room Number:</dt>
                        <dd>{video.roomNum}</dd>
                      </div>
                    </dl>
                    {video.date && video.date !== 'unknown' && (
                      <dl>
                        <div className="detail">
                          <dt>Date:</dt>
                          <dd>{video.date}</dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
