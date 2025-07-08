import { useConnection, useWallet, } from "@solana/wallet-adapter-react"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js"
import { createAssociatedTokenAccountInstruction, createInitializeInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token"
import { pack } from '@solana/spl-token-metadata'
import axios from "axios"
const Button = ({name,symbol,url,supply}) => {
    const { connection } = useConnection();
    const wallet = useWallet();

    async function onclickhandler() {

        const mintKeypair = Keypair.generate();
        const response=await axios.post('https://solana-metadata.vercel.app/api',{
            name,symbol,image:url
        })
        const metauri=`https://solana-metadata.vercel.app/metadata/${response.data.tokenID}`;
        alert(`🔗 Metadata URI created:\n${metauri}`);

        const metadata = {
            mint: mintKeypair.publicKey,
            name: name,
            symbol: symbol,
            uri: metauri,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);
        alert("🚀 Sending transaction to create mint...");

        await wallet.sendTransaction(transaction, connection);
        alert(`✅ Mint created!\nMint Address: ${mintKeypair.publicKey.toBase58()}`);


        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(associatedToken.toBase58());

        alert("🏦 Creating your token account...");
        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );

        await wallet.sendTransaction(transaction2, connection);
        alert(`✅ Token account created at:\n${associatedToken.toBase58()}`);

        alert(`💰 Minting ${supply} tokens...`);
        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey,supply*1000000000, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);
        alert(`🎉 Done!\n${supply * 1_000_000_000} tokens minted to your wallet.`);

        alert("✨ Your token is live on Solana!");

    }
    return (

        <button onClick={onclickhandler} type="button" className="text-white bg-gray-900 hover:bg-gray-950 focus:outline-1 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 shadow-none ">Create Your Token</button>

    )
}
export default Button