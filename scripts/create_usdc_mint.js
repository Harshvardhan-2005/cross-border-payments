// scripts/create_usdc_mint.js
const fs = require('fs');
const { Connection, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');

function loadKeypair(path) {
  const secret = JSON.parse(fs.readFileSync(path, 'utf8'));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

(async () => {
  const keypairPath = process.env.SOLANA_KEYPAIR || `${process.env.HOME}/.config/solana/id.json`;
  const payer = loadKeypair(keypairPath);
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  console.log('Creating a new token mint (6 decimals) ...');
  const mintPubkey = await createMint(connection, payer, payer.publicKey, null, 6); // 6 decimals (USDC-like)
  console.log('Mint address:', mintPubkey.toBase58());

  // create ATA for payer (merchant) and mint tokens to it
  const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mintPubkey, payer.publicKey);
  console.log('Merchant ATA:', ata.address.toBase58());

  // Mint 10,000 USDC (10,000 * 1e6)
  const amountToMintSmallestUnits = 10_000 * 1_000_000; // 10,000 * 10^6
  await mintTo(connection, payer, mintPubkey, ata.address, payer.publicKey, amountToMintSmallestUnits);
  console.log('Minted to merchant ATA');
})();
