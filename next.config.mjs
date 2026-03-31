/** @type {import('next').NextConfig} */
// GitHub Actions sets GITHUB_REPOSITORY=owner/repo so Pages URLs work at /<repo>/...
const ownerRepo = process.env.GITHUB_REPOSITORY || "";
const repoSlug = ownerRepo.split("/")[1];
const basePath = repoSlug ? `/${repoSlug}` : "";

const nextConfig = {
  output: "export",
  ...(basePath ? { basePath, trailingSlash: true } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
