"use client";

import React, { useState, useRef } from "react";
import {
  ExternalLink,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  LucideIcon,
} from "lucide-react";

interface MicrofrontendViewProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  src: string;
  port: number;
}

export function MicrofrontendView({
  title,
  subtitle,
  badge,
  icon: Icon,
  iconColor,
  iconBg,
  src,
  port,
}: MicrofrontendViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = src;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`flex flex-col bg-slate-50 transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white"
          : "h-screen w-full overflow-hidden"
      }`}
    >
      {/* Top Embedded Control Bar */}
      <div className="h-11 px-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shadow-2xs`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900 tracking-tight">
              {title}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/80 hidden sm:inline-block">
              {subtitle}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {badge}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live : {port}</span>
          </div>

          <button
            onClick={handleReload}
            title="Reload Module Frame"
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open standalone on port ${port}`}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-2 py-1 rounded-lg transition-colors ml-1"
          >
            <span className="hidden sm:inline">Pop Out</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Frame Body */}
      <div className="flex-1 relative w-full h-[calc(100%-44px)] bg-slate-100">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Connecting to {title} on Port {port}...</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              NextGen Unified Suite Real-Time Bridge
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0"
          allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
