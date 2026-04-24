import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import Video, {
  VideoRef,
  OnProgressData,
  OnLoadData,
  OnVideoErrorData,
  SelectedVideoTrack,
  SelectedVideoTrackType,
} from "react-native-video";
import Slider from "@react-native-community/slider";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Linking from "expo-linking";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import type { StreamingSource } from "@/types";
import { API_URL } from "@/api/client";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";

interface KaizokuPlayerProps {
  source: StreamingSource;
  title?: string;
  onProgress?: (progressMs: number, progressPercentage: number) => void;
  onEnd?: () => void;
  startPositionMs?: number;
}

/**
 * Constructs the backend proxy URL for a given upstream stream URL.
 * The proxy handles Referer headers and CORS on behalf of the client.
 *
 * Mobile uses native HTTP — no CORS issues. We still go through the proxy
 * so the backend can handle Referer spoofing and segment rewriting.
 */
function getStreamUrl(
  url: string | undefined,
  referer: string | undefined,
  isWeb: boolean,
): string {
  if (!url) return "";
  const base = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

  if (url.startsWith("/api/")) {
    return `${base}${url}`;
  }

  if (isWeb) {
    const ref = referer || "https://kwik.cx/";
    return `${base}/api/scraper/proxy?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(ref)}`;
  }

  return url;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function KaizokuPlayer({
  source,
  title,
  onProgress,
  onEnd,
  startPositionMs = 0,
}: KaizokuPlayerProps) {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWeb = Platform.OS === "web";
  const streamUrl = getStreamUrl(
    source?.url,
    source?.referer || source?.headers?.Referer,
    isWeb,
  );

  const videoSource = {
    uri: streamUrl,
    ...(source?.type === "hls" ? { type: "m3u8" } : {}),
    ...(!isWeb && source?.url && !source.url.startsWith("/api/")
      ? {
          headers: {
            Referer:
              source.referer ||
              source.headers?.Referer ||
              (source?.server?.toLowerCase().includes("kwik")
                ? "https://kwik.cx/"
                : "https://kwik.si/"),
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          },
        }
      : {}),
  };

  console.log("[KaizokuPlayer] Original Source:", source);
  console.log("[KaizokuPlayer] VideoSource sent to ExoPlayer:", videoSource);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  const togglePlayPause = useCallback(() => {
    setPaused((p) => !p);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleTap = useCallback(() => {
    if (showControls) {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      setShowControls(false);
    } else {
      resetControlsTimer();
    }
  }, [showControls, resetControlsTimer]);

  const handleProgress = useCallback(
    (data: OnProgressData) => {
      setCurrentTime(data.currentTime);
      const pct = duration > 0 ? (data.currentTime / duration) * 100 : 0;
      onProgress?.(data.currentTime * 1000, pct);
    },
    [duration, onProgress],
  );

  const handleLoad = useCallback(
    (data: OnLoadData) => {
      setDuration(data.duration);
      setBuffering(false);
      // Seek to saved position
      if (startPositionMs > 0) {
        videoRef.current?.seek(startPositionMs / 1000);
      }
    },
    [startPositionMs],
  );

  const handleBuffer = useCallback(
    ({ isBuffering }: { isBuffering: boolean }) => {
      setBuffering(isBuffering);
    },
    [],
  );

  const handleError = useCallback((e: OnVideoErrorData) => {
    console.error("[KaizokuPlayer] Error:", e.error);
    setError(
      `Playback failed: ${e.error?.localizedDescription || "Unknown error"}`,
    );
    setBuffering(false);
  }, []);

  const handleSeek = useCallback(
    (value: number) => {
      videoRef.current?.seek(value);
      resetControlsTimer();
    },
    [resetControlsTimer],
  );

  const skip = useCallback(
    (seconds: number) => {
      videoRef.current?.seek(currentTime + seconds);
      resetControlsTimer();
    },
    [currentTime, resetControlsTimer],
  );

  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    }
    setFullscreen((f) => !f);
    resetControlsTimer();
  }, [fullscreen, resetControlsTimer]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📡</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (source?.type === "iframe" || source?.type === "embed") {
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: source.url }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── Native Video ────────────────────────────────── */}
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        muted={muted}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onError={handleError}
        onEnd={onEnd}
        progressUpdateInterval={1000}
        ignoreSilentSwitch="ignore"
        playWhenInactive={false}
        playInBackground={false}
        selectedVideoTrack={{ type: SelectedVideoTrackType.AUTO }}
      />

      {/* ─── Controls Overlay ────────────────────────────── */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        activeOpacity={1}
      >
        {showControls && (
          <View style={styles.overlay}>
            {/* Title */}
            {title && (
              <View style={styles.titleBar}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {title}
                </Text>
              </View>
            )}

            {/* Center controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => skip(-10)}
              >
                <Ionicons name="play-back" size={28} color="#fff" />
                <Text style={styles.skipLabel}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseBtn}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={paused ? "play" : "pause"}
                  size={36}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => skip(10)}
              >
                <Ionicons name="play-forward" size={28} color="#fff" />
                <Text style={styles.skipLabel}>10</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom bar: seek + time + mute + fullscreen */}
            <View style={styles.bottomBar}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor={Colors.accent}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={Colors.accent}
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>

              <TouchableOpacity
                onPress={() => {
                  setMuted((m) => !m);
                  resetControlsTimer();
                }}
                style={styles.iconBtn}
              >
                <Ionicons
                  name={muted ? "volume-mute" : "volume-high"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFullscreen}
                style={styles.iconBtn}
              >
                <Ionicons
                  name={fullscreen ? "contract" : "expand"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* ─── Buffering spinner ───────────────────────────── */}
      {buffering && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "space-between",
  },
  titleBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 4,
    paddingBottom: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  titleText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: "#fff",
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  controlBtn: {
    alignItems: "center",
    opacity: 0.9,
  },
  skipLabel: {
    fontSize: Typography.xs,
    color: "#fff",
    marginTop: 2,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,202,40,0.2)",
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  timeText: {
    fontSize: Typography.xs,
    color: "rgba(255,255,255,0.8)",
    minWidth: 36,
    textAlign: "center",
  },
  iconBtn: {
    padding: 4,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  errorIcon: {
    fontSize: 36,
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  retryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: "#000",
  },
});
