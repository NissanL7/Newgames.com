import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cx, formatDuration } from '../lib/utils.js';

const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({ video, dataSaver = false, onEnded, onProgress }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Number.isFinite(video.duration) ? video.duration : 0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [ended, setEnded] = useState(false);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = window.setTimeout(() => {
        setControlsVisible(false);
        setSettingsOpen(false);
      }, 2800);
    }
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    setError(false);
    setEnded(false);
    setCurrentTime(0);
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setPlaying(false);
    element.playbackRate = speed;
    if (video.src) element.load();
  }, [video.id, video.src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const element = videoRef.current;
    if (!element || !video.src || error) return;
    if (element.paused) {
      try {
        await element.play();
      } catch {
        setPlaying(false);
      }
    } else {
      element.pause();
    }
    showControls();
  }, [error, showControls, video.src]);

  const seekBy = useCallback((amount) => {
    const element = videoRef.current;
    if (!element) return;
    element.currentTime = Math.max(0, Math.min(element.duration || video.duration || 0, element.currentTime + amount));
    showControls();
  }, [showControls, video.duration]);

  const toggleMute = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      }
    } catch {
      // Fullscreen availability depends on the browser and embedding context.
    }
  }, []);

  const togglePictureInPicture = async () => {
    const element = videoRef.current;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (element?.requestPictureInPicture) {
        await element.requestPictureInPicture();
      }
    } catch {
      // PiP can be denied by the browser or an embedding policy.
    }
  };

  const handleKeyDown = (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === ' ' || event.key.toLowerCase() === 'k') {
      event.preventDefault();
      togglePlay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seekBy(10);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seekBy(-10);
    } else if (event.key.toLowerCase() === 'm') {
      toggleMute();
    } else if (event.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cx('video-player', controlsVisible && 'controls-visible', playing && 'is-playing')}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Video player: ${video.title}`}
    >
      <video
        ref={videoRef}
        src={video.src || undefined}
        poster={video.thumbnail}
        playsInline
        preload={dataSaver ? 'none' : 'metadata'}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => { setPlaying(true); setEnded(false); showControls(); }}
        onPause={() => { setPlaying(false); setControlsVisible(true); }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => { setWaiting(false); setError(false); }}
        onLoadedData={() => { setWaiting(false); setError(false); }}
        onLoadedMetadata={(event) => {
          const media = event.currentTarget;
          if (Number.isFinite(media.duration)) setDuration(media.duration);
          media.playbackRate = speed;
          media.volume = volume;
        }}
        onTimeUpdate={(event) => {
          const media = event.currentTarget;
          setCurrentTime(media.currentTime);
          onProgress?.(media.currentTime, media.duration || duration);
        }}
        onEnded={() => { setEnded(true); setPlaying(false); setControlsVisible(true); onEnded?.(); }}
        onError={() => { if (video.src) { setError(true); setWaiting(false); } }}
      />

      {!video.src && (
        <div className="player-message"><LoaderCircle className="spin" size={30} /><span>Preparing your local video…</span></div>
      )}
      {error && (
        <div className="player-message error-message">
          <AlertTriangle size={30} />
          <strong>This video couldn’t load</strong>
          <span>Check your connection and try again.</span>
          <button className="button button-light" onClick={() => { setError(false); videoRef.current?.load(); }}>Retry</button>
        </div>
      )}
      {waiting && !error && <span className="player-loader"><LoaderCircle className="spin" size={38} /></span>}
      {!playing && !waiting && !error && video.src && (
        <button className="player-center-play" onClick={togglePlay} aria-label={ended ? 'Replay video' : 'Play video'}>
          {ended ? <RotateCcw size={32} /> : <Play size={34} fill="currentColor" />}
        </button>
      )}

      <div className="player-controls" onClick={(event) => event.stopPropagation()}>
        <input
          className="player-seek"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          style={{ '--seek-progress': `${duration ? (currentTime / duration) * 100 : 0}%` }}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = value;
            setCurrentTime(value);
          }}
          aria-label="Seek video"
        />
        <div className="player-control-row">
          <div className="player-control-group">
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <button onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds" className="desktop-player-control"><RotateCcw size={20} /></button>
            <button onClick={() => seekBy(10)} aria-label="Skip forward 10 seconds" className="desktop-player-control"><RotateCw size={20} /></button>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <input
              className="volume-slider desktop-player-control"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(event) => {
                const value = Number(event.target.value);
                setVolume(value);
                setMuted(value === 0);
                if (videoRef.current) { videoRef.current.volume = value; videoRef.current.muted = value === 0; }
              }}
              aria-label="Volume"
            />
            <span className="player-time">{formatDuration(currentTime)} <span>/</span> {formatDuration(duration)}</span>
          </div>
          <div className="player-control-group">
            <div className="player-settings-wrap">
              <button className={settingsOpen ? 'active' : ''} onClick={() => { setSettingsOpen((open) => !open); showControls(); }} aria-label="Playback settings"><Settings2 size={21} /></button>
              {settingsOpen && (
                <div className="playback-menu">
                  <div className="playback-menu-title">Playback speed <span>{speed === 1 ? 'Normal' : `${speed}×`}</span></div>
                  <div className="speed-grid">
                    {speeds.map((value) => (
                      <button
                        key={value}
                        className={speed === value ? 'active' : ''}
                        onClick={() => {
                          setSpeed(value);
                          if (videoRef.current) videoRef.current.playbackRate = value;
                        }}
                      >
                        {value === 1 ? 'Normal' : `${value}×`}{speed === value && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {document.pictureInPictureEnabled && <button onClick={togglePictureInPicture} aria-label="Picture in picture" className="desktop-player-control"><PictureInPicture2 size={21} /></button>}
            <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
              {fullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
