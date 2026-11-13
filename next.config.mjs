/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-mariadb",
    "mariadb",
  ],
};

export default nextConfig;
