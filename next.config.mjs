/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['convex', 'lucide-react'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.convex.cloud',
            },
            {
                protocol: 'https',
                hostname: '**.convex.site',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },
};

export default nextConfig;
