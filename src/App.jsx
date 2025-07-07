import { ConnectionProvider, useConnection, useWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import TopBar from "./components/TopBar"
import Input from "./components/Input"
import { useState } from "react"
import Button from "./components/Button"
function App() {

  const [name, setName] = useState("")
  const [sym, setsym] = useState("")
  const [img, setimg] = useState("")
  const [supply, setsupply] = useState(0)

  return (
    <div className="bg-slate-800 h-screen">
      <ConnectionProvider endpoint="https://api.devnet.solana.com
">
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <TopBar />
            <div className="h-[calc(100vh-80px)] flex items-center justify-center">
              <div className="w-xl flex flex-col items-center gap-6 mb-6">
                <div className="text-5xl text-white font-bold">
                  Solana Token Launchpad
                </div>
                <Input fxn={(e) => setName(e.target.value)} title="Name" />
                <Input fxn={(e) => setsym(e.target.value)} title="Symbol" />
                <Input fxn={(e) => setimg(e.target.value)} title="Image Public Url" />
                <Input fxn={(e) => setsupply(Number(e.target.value))} title="Initial Supply" />
                <Button name={name} symbol={sym} url={img} supply={supply}/>
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

export default App
