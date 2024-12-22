import React, { useEffect, useMemo } from 'react';

const VideoModal = ({ selectedVideo, setSelectedVideo, groupedVideos, selectedSession, activeTab, setActiveTab, handleTimeUpdate }) => {
  // Always call hooks at the top level
  const sessionVideos = useMemo(() => groupedVideos[selectedSession] || [], [groupedVideos, selectedSession]);

  // Set the first video as the active tab if none is selected
  useEffect(() => {
    if (sessionVideos.length > 0 && !activeTab) {
      setActiveTab(sessionVideos[0].fullVideoName);
    }
  }, [sessionVideos, activeTab, setActiveTab]);

  // Find the active video (not conditional, placed at the top)
  const activeVideo = useMemo(
    () => sessionVideos.find((video) => video.fullVideoName === activeTab) || null,
    [sessionVideos, activeTab]
  );

  // If no video is selected, return null
  if (!selectedVideo) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
          {activeVideo && (
            <div key={activeVideo.fileKey}>
              {activeVideo.s3Url ? (
                <>
                  <video
                    width="560"
                    height="315"
                    src={activeVideo.s3Url}
                    controls
                    onTimeUpdate={(e) => handleTimeUpdate(activeVideo.fileKey, e.target.currentTime)}
                  ></video>
                  <div className="video-details">
                    <h4>Session Details:</h4>
                    <div className='lists-wrapper'>
                      <dl>
                        <div className='detail'>
                          <dt>Unique Session Name:</dt>
                          <dd>{activeVideo.uniqueSessionName}</dd>
                        </div>
                        <div className='detail'>
                          <dt>Camera:</dt>
                          <dd>{activeVideo.cameraName}</dd>
                        </div>
                        <div className='detail'>
                          <dt>Meeting Number:</dt>
                          <dd>{activeVideo.roomNum}</dd>
                        </div>
                        <div className='detail'>
                          <dt>Room Number:</dt>
                          <dd>{activeVideo.meetingNum}</dd>
                        </div>
                      </dl>
                      <dl>
                        {activeVideo.date && activeVideo.date !== 'unknown' && (
                          <div className='detail'>
                            <dt>Date:</dt>
                            <dd>{new Date(activeVideo.date).toLocaleDateString('he-IL')}</dd>
                          </div>
                        )}
                        {activeVideo.time && activeVideo.time !== 'unknown' && (
                          <div className='detail'>
                            <dt>Time:</dt>
                            <dd>{activeVideo.time}</dd>
                          </div>
                        )}
                        <div className='detail'>
                          <dt>Patient Code:</dt>
                          <dd>{activeVideo.patientCode}</dd>
                        </div>
                        <div className='detail'>
                          <dt>Therapist Code:</dt>
                          <dd>{activeVideo.therapistCode}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </>
              ) : (
                <p>Session not available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
