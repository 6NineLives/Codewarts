"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RecognitionResult {
  type: string;
  sign: string;
  confidence: number;
  stable: boolean;
  stable_sign: string | null;
}

export function useFSLRecognition(videoElement: HTMLVideoElement | null) {
  const [currentSign, setCurrentSign] = useState<string>("...");
  const [confidence, setConfidence] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const holisticRef = useRef<any>(null);

  const onResults = useCallback((results: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Extract keypoints to match server expectation (258 floats)
    const extractKeypoints = (results: any) => {
      const pose = results.poseLandmarks 
        ? results.poseLandmarks.flatMap((l: any) => [l.x, l.y, l.z, l.visibility]) 
        : new Array(33 * 4).fill(0);
      
      const lh = results.leftHandLandmarks 
        ? results.leftHandLandmarks.flatMap((l: any) => [l.x, l.y, l.z]) 
        : new Array(21 * 3).fill(0);
        
      const rh = results.rightHandLandmarks 
        ? results.rightHandLandmarks.flatMap((l: any) => [l.x, l.y, l.z]) 
        : new Array(21 * 3).fill(0);
        
      return [...pose, ...lh, ...rh];
    };

    const keypoints = extractKeypoints(results);
    wsRef.current.send(JSON.stringify({ type: "keypoints", data: keypoints }));
  }, []);

  useEffect(() => {
    // Initialize WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/recognize");
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data: RecognitionResult = JSON.parse(event.data);
      if (data.type === "prediction") {
        setCurrentSign(data.sign);
        setConfidence(data.confidence);
        if (data.stable && data.stable_sign) {
          setHistory(prev => {
            if (prev.length > 0 && prev[prev.length - 1] === data.stable_sign) return prev;
            return [...prev, data.stable_sign].slice(-10);
          });
        }
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!videoElement) return;

    // Initialize MediaPipe Holistic
    const initMediaPipe = async () => {
      // Dynamic import to avoid SSR issues
      const { Holistic } = await import("@mediapipe/holistic");
      const { Camera } = await import("@mediapipe/camera_utils");

      const holistic = new Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults(onResults);
      holisticRef.current = holistic;

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await holistic.send({ image: videoElement });
        },
        width: 1280,
        height: 720,
      });

      camera.start();
    };

    initMediaPipe();

    return () => {
      if (holisticRef.current) {
        holisticRef.current.close();
      }
    };
  }, [videoElement, onResults]);

  return { currentSign, confidence, history, isConnected };
}
