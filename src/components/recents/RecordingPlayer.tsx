"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Pause } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { CallLogEntry } from "@/lib/types";

interface RecordingPlayerProps {
  log: CallLogEntry;
}

export function RecordingPlayer({ log }: RecordingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRecording = log.recordingStatus === "completed" && log.recordingSid;
  const isProcessing = log.recordingStatus === "processing";

  useEffect(() => {
    if (!hasRecording) {
      return;
    }

    let objectUrl: string | null = null;

    async function loadAudio() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          setError("Sign in required");
          return;
        }

        const response = await fetch(`/api/recordings/${log.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError("Could not load recording");
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
      } catch {
        setError("Failed to load");
      } finally {
        setIsLoading(false);
      }
    }

    loadAudio();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [hasRecording, log.id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-cosmic-muted">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Recording...</span>
      </div>
    );
  }

  if (!hasRecording) {
    return null;
  }

  if (error) {
    return <span className="text-xs text-cosmic-muted">{error}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={togglePlay}
        disabled={isLoading || !audioSrc}
        aria-label={isPlaying ? "Pause recording" : "Play recording"}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-4 text-cosmic-violet-light" />
        ) : (
          <Play className="size-4 text-cosmic-violet-light" />
        )}
      </Button>
      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      ) : null}
    </div>
  );
}
