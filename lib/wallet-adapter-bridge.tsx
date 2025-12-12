"use client"

import dynamic from "next/dynamic"
import { useWallet } from "./wallet-provider"

const WalletAdapterLaserEyesHooks = dynamic(
  () => import("./wallet-adapter-lasereyes-hooks").then((mod) => ({ default: mod.WalletAdapterLaserEyesHooks })),
  { ssr: false },
)

export function WalletAdapterBridge() {
  const wallet = useWallet()

  return <WalletAdapterLaserEyesHooks wallet={wallet} />
}
