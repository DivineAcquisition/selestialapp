"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.33, 0, 1], // Purple base matching #5500FF
      markerColor: [0.61, 0.59, 1], // Light purple matching #9D96FF
      glowColor: [0.33, 0, 1],
      markers: [
        // Major US cities for home services
        { location: [37.7595, -122.4367], size: 0.05 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.08 }, // New York
        { location: [34.0522, -118.2437], size: 0.06 }, // Los Angeles
        { location: [41.8781, -87.6298], size: 0.05 }, // Chicago
        { location: [29.7604, -95.3698], size: 0.05 }, // Houston
        { location: [33.749, -84.388], size: 0.04 }, // Atlanta
        { location: [47.6062, -122.3321], size: 0.04 }, // Seattle
        { location: [25.7617, -80.1918], size: 0.04 }, // Miami
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={cn("opacity-90", className)}
    />
  );
};

export default Globe;
