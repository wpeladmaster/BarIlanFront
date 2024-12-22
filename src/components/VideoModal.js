import React, { useEffect, useMemo, useState } from 'react';

const VideoModal = ({ selectedVideo, setSelectedVideo, groupedVideos, selectedSession, activeTab, setActiveTab, handleTimeUpdate }) => {
  const [fetchedVideoData, setFetchedVideoData] = useState(null); // State for video data

  const sessionVideos = useMemo(() => {
    return groupedVideos[selectedSession] || [];
  }, [groupedVideos, selectedSession]);

  useEffect(() => {
    if (sessionVideos.length > 0 && !activeTab) {
      setActiveTab(sessionVideos[0].fullVideoName);
    }
  }, [sessionVideos, activeTab, setActiveTab]);

  useEffect(() => {
    if (activeTab) {
      fetchVideoData(activeTab);
    }
  }, [activeTab]);

  const fetchVideoData = (tab) => {
    // Simulating a fetch request for video data based on the tab
    const video = sessionVideos.find((video) => video.fullVideoName === tab);
    if (video) {
      // Simulate asynchronous data fetch
      setTimeout(() => {
        setFetchedVideoData(video);
      }, 300); // Simulated delay
    }
  };

  if (!selectedVideo) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFetchedVideoData(null); // Clear data until the fetch is complete
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setSelectedVideo(null)}>&times;</span>
        <div className="tabs">
          {sessionVideos.map((video) => (
            <button
              key={video.fileKey}
              className={video.fullVideoName === activeTab ? 'active' : ''}
              onClick={() => handleTabChange(video.fullVideoName)}
            >
              {video.fullVideoName}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {fetchedVideoData ? (
            fetchedVideoData.s3Url ? (
              <>
                <video
                  width="560"
                  height="315"
                  src={fetchedVideoData.s3Url}
                  controls
                  onTimeUpdate={(e) => handleTimeUpdate(fetchedVideoData.fileKey, e.target.currentTime)}
                ></video>
                <div className="video-details">
                  <h4>Session Details:</h4>
                  <div className="lists-wrapper">
                    <dl>
                      <div className="detail">
                        <dt>Unique Session Name:</dt>
                        <dd>{fetchedVideoData.uniqueSessionName}</dd>
                      </div>
                      <div className="detail">
                        <dt>Camera:</dt>
                        <dd>{fetchedVideoData.cameraName}</dd>
                      </div>
                      <div className="detail">
                        <dt>Meeting Number:</dt>
                        <dd>{fetchedVideoData.roomNum}</dd>
                      </div>
                      <div className="detail">
                        <dt>Room Number:</dt>
                        <dd>{fetchedVideoData.meetingNum}</dd>
                      </div>
                    </dl>
                    <dl>
                      {fetchedVideoData.date && fetchedVideoData.date !== 'unknown' && (
                        <div className="detail">
                          <dt>Date:</dt>
                          <dd>{new Date(fetchedVideoData.date).toLocaleDateString('he-IL')}</dd>
                        </div>
                      )}
                      {fetchedVideoData.time && fetchedVideoData.time !== 'unknown' && (
                        <div className="detail">
                          <dt>Time:</dt>
                          <dd>{fetchedVideoData.time}</dd>
                        </div>
                      )}
                      <div className="detail">
                        <dt>Patient Code:</dt>
                        <dd>{fetchedVideoData.patientCode}</dd>
                      </div>
                      <div className="detail">
                        <dt>Therapist Code:</dt>
                        <dd>{fetchedVideoData.therapistCode}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            ) : (
              <p>Session not available.</p>
            )
          ) : (
            <p>Loading video data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
