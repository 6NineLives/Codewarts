"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface FSLState {
  frame: string | null;
  fps: number;
  isCollecting: boolean;
  detectedSigns: string[];
  translation: string;
  newSign: string | null;
  confidence: number;
  connected: boolean;
}

const INITIAL_STATE: FSLState = {
  frame: null,
  fps: 0,
  isCollecting: false,
  detectedSigns: [],
  translation: "",
  newSign: null,
  confidence: 0,
  connected: false,
};

const WS_URL = "ws://localhost:8000/ws";
const API_URL = "http://localhost:8000";

export function useFSLWebSocket() {
  const [state, setState] = useState<FSLState>(INITIAL_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
      console.log("[ws] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "frame") {
          setState((prev) => ({
            ...prev,
            frame: data.frame,
            fps: data.fps,
            isCollecting: data.is_collecting,
            detectedSigns: data.detected_signs || [],
            translation: data.translation || prev.translation,
            newSign: data.new_sign,
            confidence: data.confidence,
          }));
        }
      } catch {
        // skip malformed messages
      }
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
      console.log("[ws] Disconnected — reconnecting in 2s");
      reconnectTimerRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendAction = useCallback(
    (action: string, extra?: Record<string, unknown>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action, ...extra }));
      }
    },
    []
  );

  const startCollecting = useCallback(() => sendAction("start"), [sendAction]);

  const stopCollecting = useCallback(async () => {
    // Use REST endpoint so we get the translation back synchronously
    try {
      const res = await fetch(`${API_URL}/api/collect/stop`, { method: "POST" });
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        isCollecting: false,
        translation: data.translation || prev.translation,
      }));
    } catch {
      sendAction("stop");
    }
  }, [sendAction]);

  const clearAll = useCallback(() => {
    sendAction("clear");
    setState((prev) => ({
      ...prev,
      detectedSigns: [],
      translation: "",
      newSign: null,
    }));
  }, [sendAction]);

  const toggleTTS = useCallback(() => sendAction("tts_toggle"), [sendAction]);

  const setSensitivity = useCallback(
    (value: number) => sendAction("set_sensitivity", { value }),
    [sendAction]
  );

  return {
    ...state,
    startCollecting,
    stopCollecting,
    clearAll,
    toggleTTS,
    setSensitivity,
  };
}
