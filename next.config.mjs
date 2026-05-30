const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;
const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;

function extractHostname(url) {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

const imageHostnames = Array.from(
    new Set([
        extractHostname(convexUrl),
        extractHostname(convexSiteUrl),
        'images.pexels.com',
        'via.placeholder.com',
    ].filter(Boolean)),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['convex', 'lucide-react'],
    env: {
        ...(convexUrl ? { NEXT_PUBLIC_CONVEX_URL: convexUrl } : {}),
        ...(convexSiteUrl ? { NEXT_PUBLIC_CONVEX_SITE_URL: convexSiteUrl } : {}),
    },
    images: {
        unoptimized: true,
        remotePatterns: imageHostnames.map((hostname) => ({
            protocol: 'https',
            hostname,
        })),
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https:",
                            "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://api.stripe.com ws://localhost:* wss://localhost:* ws://127.0.0.1:* wss://127.0.0.1:*",
                            "frame-src https://js.stripe.com https://hooks.stripe.com https://maps.google.com https://www.google.com",
                            "worker-src 'self' blob:",
                        ].join('; '),
                    },
                ],
            },
            {
                // Allow the admin service worker (served from root) to control /admin/ scope
                source: '/admin-sw.js',
                headers: [
                    { key: 'Service-Worker-Allowed', value: '/admin/' },
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                ],
            },
        ];
    },
};

export default nextConfig;
