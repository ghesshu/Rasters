import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  injected,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

// Enhanced config with Phantom wallet support
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ 
      target: 'phantom',
      shimDisconnect: true 
    }), // Phantom wallet connector
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
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
