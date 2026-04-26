"use client";
import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const HERO_VIDEO_ID = "kg218cqrg7hzg0ghqj531aqpy180haz8" as any;

interface VideoContextType {
    heroVideoUrl: string | null | undefined;
}

const VideoContext = createContext<VideoContextType>({ heroVideoUrl: undefined });

export function VideoProvider({ children }: { children: ReactNode }) {
    const heroVideoUrl = useQuery(api.files.getUrl, { storageId: HERO_VIDEO_ID });

    return (
        <VideoContext.Provider value={{ heroVideoUrl }}>
            {children}
        </VideoContext.Provider>
    );
}

export function useHeroVideoUrl(): string | null | undefined {
    const { heroVideoUrl } = useContext(VideoContext);
    return heroVideoUrl;
}
