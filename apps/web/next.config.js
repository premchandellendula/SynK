/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "@repo/ui",
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                pathname: '/photos/**',
            },
        ],
    },
};

export default nextConfig;