"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!convexUrl) {
    throw new Error(
        "Missing Convex URL. Set NEXT_PUBLIC_CONVEX_URL (or VITE_CONVEX_URL) in your deployment environment.",
    );
}

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
