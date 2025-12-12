"use client"

import type { ReactNode } from "react"
import { WalletProviderImplementation } from "./wallet-provider-implementation"
import { LaserEyesProviderClient } from "./lasereyes-provider-client"
import { WalletAdapterBridge } from "./wallet-adapter-bridge"

export function WalletProviderClient({ children }: { children: ReactNode }) {
  return (
    <WalletProviderImplementation>
      <LaserEyesProviderClient>
        <WalletAdapterBridge />
        {children}
      </LaserEyesProviderClient>
    </WalletProviderImplementation>
  )
}
