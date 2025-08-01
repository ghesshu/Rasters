import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  metaMask,
  injected,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

// Enhanced config with multiple wallet connectors
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID, // Get this from https://cloud.walletconnect.com
      metadata: {
        name: "Rasters AI",
        description: "AI-powered crypto trading platform",
        url: "https://rasters-ai.vercel.app/",
        icons: [
          "https://rasters-ai.vercel.app/_next/static/media/site_logo_1.e0c6549f.svg",
        ],
      },
    }),
    coinbaseWallet({
      appName: "Rasters AI",
      appLogoUrl:
        "https://rasters-ai.vercel.app/_next/static/media/site_logo_1.e0c6549f.svg",
    }),
    injected(), // Fallback for other injected wallets
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
