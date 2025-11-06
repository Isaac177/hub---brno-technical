import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useVideoPlayer } from '../../contexts/VideoPlayerContext';
import { useCourseProgress } from '../../contexts/CourseProgressContext';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayer = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const { currentTopic, updateProgress, courseId, enrollmentId } = useVideoPlayer();
  const { updateVideoProgress } = useCourseProgress();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getVideoUrl = (key) => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    
    const parts = key.split('/');
    const sessionId = parts[1];
    const fileId = parts[2];
    
    const S3_BUCKET_URL = 'https://quralay-course.s3.ap-south-1.amazonaws.com/';
    const fullUrl = `${S3_BUCKET_URL}temp/${sessionId}/${fileId}`;
    return fullUrl;
  };

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-big-play-centered', 'video-js');
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      fluid: false,
      responsive: true,
      aspectRatio: '16:9',
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'progressControl',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
    });

    player.on('waiting', () => setIsLoading(true));
    player.on('canplay', () => setIsLoading(false));
    player.on('playing', () => {
      setIsLoading(false);
      setPlaying(true);
    });
    player.on('error', (error) => {
      console.error('Video.js Error:', error);
      setError(t('videoPlayer.error'));
      setIsLoading(false);
    });
    player.on('loadedmetadata', () => {
      setDuration(player.duration());
    });

    player.on('timeupdate', () => {
      if (!seeking) {
        const currentTime = player.currentTime();
        const duration = player.duration();
        const progress = (currentTime / duration) * 100;
        setPlayed(progress);
        
        updateProgress(progress);
        updateVideoProgress(courseId, enrollmentId, currentTopic.id, progress);
      }
    });

    playerRef.current = player;
    setPlayer(player);

    if (currentTopic?.videoUrl) {
      const videoUrl = getVideoUrl(currentTopic.videoUrl);
      
      if (videoUrl) {
        loadVideoSource(player, videoUrl);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const loadVideoSource = (player, videoUrl) => {
    try {
      const isHLS = videoUrl.includes('.m3u8');
      player.src({
        src: videoUrl,
        type: isHLS ? 'application/x-mpegURL' : 'video/mp4'
      });
      player.load();
    } catch (err) {
      console.error('Error loading video source:', err);
      setError(t('videoPlayer.error'));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!player || !currentTopic?.videoUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    const videoUrl = getVideoUrl(currentTopic.videoUrl);

    if (!videoUrl) {
      setError(t('videoPlayer.invalidUrl'));
      setIsLoading(false);
      return;
    }

    loadVideoSource(player, videoUrl);
    
    const lastPosition = localStorage.getItem(`video-progress-${currentTopic.id}`);
    if (lastPosition) {
      try {
        player.currentTime(parseFloat(lastPosition));
      } catch (err) {
        console.error('Error setting video position:', err);
      }
    }
  }, [currentTopic, player]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    playing ? player.pause() : player.play();
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    player.volume(newVolume);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
    player.muted(!player.muted());
  };

  const handleSeekChange = (value) => {
    const newTime = (value[0] / 100) * duration;
    setPlayed(value[0]);
    player.currentTime(newTime);
  };

  const handleProgress = ({ played, loaded }) => {
    if (!seeking) {
      setPlayed(played * 100);
      setLoaded(loaded * 100);
      
      const currentTime = player.currentTime();
      localStorage.setItem(`video-progress-${currentTopic.id}`, currentTime.toString());
      
      updateProgress(currentTopic.id, played * 100);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    player.playbackRate(rate);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  if (!currentTopic?.videoUrl) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted">
        <p className="text-muted-foreground">{t('videoPlayer.selectTopic')}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={videoRef} className="video-js-container h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="text-white bg-red-500 px-4 py-2 rounded">{error}</div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 z-20">
        <div className="space-y-2">
          <Slider
            value={[played]}
            max={100}
            step={0.1}
            onValueChange={handleSeekChange}
            className="w-full"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="text-white hover:text-white"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleMute}
                  className="text-white hover:text-white"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-[100px]"
                />
              </div>

              <span className="text-sm text-white">
                {formatTime(duration * played / 100)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-white">
                    {playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PLAYBACK_RATES.map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white"
                onClick={() => player.requestFullscreen()}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
