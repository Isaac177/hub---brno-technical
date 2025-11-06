import React, { useRef, useEffect, useState } from 'react';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import { useVideoPlayer } from '../../contexts/VideoPlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import { getVideoUrl } from '../../utils/getVideoUrl';
import { useTranslation } from 'react-i18next';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useCourseProgress } from '../../hooks/useCourseProgress';

const VideoPlayer = ({
  videoUrl,
  topicId,
  title,
  posterUrl,
  courseId,
  enrollmentId,
  onProgressUpdate,
  course
}) => {
  const player = useRef(null);
  const progressIntervalRef = useRef(null);
  const hasReachedFifty = useRef(false);
  const hasReachedNinetyFive = useRef(false);
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  
  const { updateProgress } = useVideoPlayer();
  const { updateVideoProgress, isUpdatingVideo } = useCourseProgress(course);
  const { user } = useAuth();
  const { t } = useTranslation();

  const updateProgressData = (currentTime, duration) => {
    const progress = (currentTime / duration) * 100;
    const milestone = progress >= 95 ? 'completed' : progress >= 50 ? 'halfway' : 'started';
    
    return {
      progress,
      progressData: {
        id: topicId,
        progress,
        lastUpdated: new Date().toISOString(),
        duration,
        currentTime,
        completed: progress >= 95,
        milestone
      }
    };
  };

  const sendProgressUpdate = (progress, progressData) => {
    if (!courseId || !enrollmentId || !user?.email) return;

    const progressKey = `video-progress-${user.email}-${topicId}`;
    localStorage.setItem(progressKey, player.current.currentTime.toString());

    updateVideoProgress({
      courseId,
      enrollmentId,
      topicId,
      userEmail: user.email,
      progressData,
      componentProgress: {
        videos: {
          total: 1,
          completed: progress >= 95 ? 1 : 0,
          byId: {
            [topicId]: progressData
          }
        },
        quizzes: {
          total: 0,
          completed: 0,
          byId: {}
        }
      },
      topicsProgress: {
        [topicId]: {
          videoProgress: progress,
          lastUpdated: new Date().toISOString()
        }
      },
      totalComponents: 1,
      completedComponents: progress >= 95 ? 1 : 0
    });
  };

  const handleTimeUpdate = () => {
    if (!player.current?.currentTime || !videoUrl || !topicId || !courseId || !enrollmentId || !user?.email) {
      return;
    }

    const currentTime = player.current.currentTime;
    const videoDuration = player.current.duration;

    if (currentTime > 0 && videoDuration > 0 && isFinite(currentTime) && isFinite(videoDuration)) {
      const { progress, progressData } = updateProgressData(currentTime, videoDuration);
      
      onProgressUpdate?.(progress);
      
      const shouldUpdateProgress = 
        (progress >= 50 && !hasReachedFifty.current) || 
        (progress >= 95 && !hasReachedNinetyFive.current);

      if (shouldUpdateProgress) {
        if (progress >= 50) hasReachedFifty.current = true;
        if (progress >= 95) hasReachedNinetyFive.current = true;
        
        sendProgressUpdate(progress, progressData);
      }

      setPlayed(progress);
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;
    progressIntervalRef.current = setInterval(handleTimeUpdate, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!player.current || !videoUrl || !topicId || !courseId || !enrollmentId || !user?.email) {
      return;
    }

    const progressKey = `video-progress-${user.email}-${topicId}`;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      const progress = parseFloat(savedProgress);
      if (!isNaN(progress) && player.current.currentTime !== undefined) {
        player.current.currentTime = progress;
      }
    }

    const handlePlay = () => {
      startProgressTracking();
      setPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      stopProgressTracking();
      handleTimeUpdate();
      setPlaying(false);
    };

    const handleEnded = () => {
      stopProgressTracking();
      handleTimeUpdate();
      setPlaying(false);
    };

    player.current.addEventListener('play', handlePlay);
    player.current.addEventListener('pause', handlePause);
    player.current.addEventListener('ended', handleEnded);

    return () => {
      stopProgressTracking();
      if (player.current) {
        player.current.removeEventListener('play', handlePlay);
        player.current.removeEventListener('pause', handlePause);
        player.current.removeEventListener('ended', handleEnded);
      }
      hasReachedFifty.current = false;
      hasReachedNinetyFive.current = false;
    };
  }, [videoUrl, topicId, courseId, enrollmentId, user?.email]);

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted">
        <p className="text-muted-foreground">{t('videoPlayer.selectTopic')}</p>
      </div>
    );
  }

  const formattedVideoUrl = getVideoUrl(videoUrl);
  const source = {
    src: formattedVideoUrl,
    type: formattedVideoUrl?.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
  };

  return (
    <div className="relative w-full h-full bg-black">
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white bg-red-500 px-4 py-2 rounded">{t('videoPlayer.accessError')}</div>
        </div>
      )}

      <MediaPlayer
        className="w-full h-full border-none rounded-none"
        title={title}
        src={source}
        crossOrigin
        playsInline
        ref={player}
        autoPlay={playing}
        onError={(e) => {
          console.error('Media Player Error:', e);
          setError(t('videoPlayer.error'));
          setIsLoading(false);
          setIsBuffering(false);
        }}
        onCanPlay={() => {
          setIsLoading(false);
          setIsBuffering(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      >
        <MediaProvider>
          {posterUrl && <Poster src={posterUrl} alt={title} />}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {isUpdatingVideo && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {t('videoPlayer.savingProgress')}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;