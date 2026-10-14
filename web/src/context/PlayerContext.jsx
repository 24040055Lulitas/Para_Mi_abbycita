import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { allTrackRefs, favoritesTrackRefs } from '../data/catalog';

const PlayerContext = createContext(null);

const LIKED_KEY = 'abbyplayer-liked';
const LIKED_SEEDED_KEY = 'abbyplayer-liked-seeded';

function loadLiked() {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    const files = raw ? JSON.parse(raw) : [];
    let set = new Set(files);
    if (!localStorage.getItem(LIKED_SEEDED_KEY)) {
      favoritesTrackRefs().forEach((ref) => set.add(ref.file));
      localStorage.setItem(LIKED_SEEDED_KEY, '1');
    }
    return set;
  } catch {
    return new Set(favoritesTrackRefs().map((ref) => ref.file));
  }
}

const RESUME_KEY = 'abbyplayer-last-session';

/* última canción y segundo en que se quedó, para "continuar donde te
   quedaste" — se guarda en localStorage cada pocos segundos */
function loadLastSession() {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const { key, time } = JSON.parse(raw);
    const track = allTrackRefs().find((t) => t.key === key);
    return track ? { track, time: Number(time) || 0 } : null;
  } catch {
    return null;
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off | all | one
  const [likedFiles, setLikedFiles] = useState(loadLiked);
  const [lastSession] = useState(loadLastSession);
  const pendingSeekRef = useRef(null);

  const current = queueIndex >= 0 ? queue[queueIndex] : null;

  const persistLiked = useCallback((set) => {
    setLikedFiles(new Set(set));
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
    } catch {
      /* almacenamiento no disponible, seguimos en memoria */
    }
  }, []);

  const toggleLike = useCallback(
    (file) => {
      const next = new Set(likedFiles);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      persistLiked(next);
    },
    [likedFiles, persistLiked]
  );

  const isLiked = useCallback((file) => likedFiles.has(file), [likedFiles]);

  const updateMediaSession = useCallback((track) => {
    if (!('mediaSession' in navigator) || !track) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.subtitle || 'Billie Eilish',
      album: 'para ABBY',
      artwork: track.cover ? [{ src: track.cover, sizes: '512x512', type: 'image/png' }] : [],
    });
    try {
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    } catch {
      /* algunos navegadores no soportan null aquí, no es crítico */
    }
  }, []);

  const playAt = useCallback(
    (list, index) => {
      const audio = audioRef.current;
      if (!audio || !list[index]) return;
      setQueue(list);
      setQueueIndex(index);
      const track = list[index];
      if (audio.src !== track.file) {
        audio.src = track.file;
      }
      audio.play().catch(() => {});
      setIsPlaying(true);
      updateMediaSession(track);
    },
    [updateMediaSession]
  );

  const playTrackRef = useCallback(
    (track, list) => {
      const fullList = list && list.length ? list : [track];
      const index = fullList.findIndex((t) => t.key === track.key);
      playAt(fullList, index === -1 ? 0 : index);
    },
    [playAt]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [current, isPlaying]);

  const next = useCallback(() => {
    if (!queue.length) return;
    if (shuffle) {
      const idx = Math.floor(Math.random() * queue.length);
      playAt(queue, idx);
      return;
    }
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      playAt(queue, nextIndex);
    } else if (repeatMode === 'all') {
      playAt(queue, 0);
    } else {
      setIsPlaying(false);
    }
  }, [queue, queueIndex, shuffle, repeatMode, playAt]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) playAt(queue, prevIndex);
    else playAt(queue, queue.length - 1);
  }, [queue, queueIndex, playAt]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v) => {
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolumeState(v);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off')),
    []
  );

  /* "a continuación": agrega una canción justo después de la que está
     sonando. Si no hay nada sonando, la pone a reproducir de una vez. */
  const addToQueue = useCallback(
    (track) => {
      if (queueIndex === -1) {
        playAt([track], 0);
        return;
      }
      setQueue((q) => {
        const next2 = [...q];
        next2.splice(queueIndex + 1, 0, track);
        return next2;
      });
    },
    [queueIndex, playAt]
  );

  const removeFromQueue = useCallback(
    (index) => {
      setQueue((q) => q.filter((_, i) => i !== index));
    },
    []
  );

  /* deja solo la canción actual, tira todo lo que seguía */
  const clearQueue = useCallback(() => {
    setQueue((q) => (queueIndex >= 0 ? q.slice(0, queueIndex + 1) : q));
  }, [queueIndex]);

  const upcoming = useMemo(
    () => (queueIndex >= 0 ? queue.slice(queueIndex + 1) : []),
    [queue, queueIndex]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      if (pendingSeekRef.current != null) {
        audio.currentTime = Math.min(pendingSeekRef.current, Math.max(0, (audio.duration || 0) - 1));
        pendingSeekRef.current = null;
      }
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      next();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => next());
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatMode, next, prev, togglePlay]);

  /* guarda la sesión cada ~5 s de reproducción */
  const savedSecond = Math.floor(currentTime / 5);
  useEffect(() => {
    if (!current) return;
    try {
      localStorage.setItem(
        RESUME_KEY,
        JSON.stringify({ key: current.key, time: Math.floor(audioRef.current?.currentTime || 0) })
      );
    } catch {
      /* almacenamiento no disponible */
    }
  }, [current, savedSecond]);

  const resume = useCallback(() => {
    if (!lastSession) return;
    pendingSeekRef.current = lastSession.time;
    playTrackRef(lastSession.track);
  }, [lastSession, playTrackRef]);

  const likedTrackRefs = useMemo(
    () => allTrackRefs().filter((ref) => likedFiles.has(ref.file)),
    [likedFiles]
  );

  const value = useMemo(
    () => ({
      current,
      queue,
      queueIndex,
      upcoming,
      isPlaying,
      currentTime,
      duration,
      volume,
      shuffle,
      repeatMode,
      likedFiles,
      likedTrackRefs,
      lastSession,
      resume,
      playTrackRef,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
      toggleLike,
      isLiked,
      addToQueue,
      removeFromQueue,
      clearQueue,
      formatTime,
    }),
    [
      current,
      queue,
      queueIndex,
      upcoming,
      isPlaying,
      currentTime,
      duration,
      volume,
      shuffle,
      repeatMode,
      likedFiles,
      likedTrackRefs,
      lastSession,
      resume,
      playTrackRef,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
      toggleLike,
      isLiked,
      addToQueue,
      removeFromQueue,
      clearQueue,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer debe usarse dentro de <PlayerProvider>');
  return ctx;
}
