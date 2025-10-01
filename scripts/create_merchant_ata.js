// scripts/create_merchant_ata.js
const fs = require('fs');
const { Connection, Keypair, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');

function loadKeypair(path) {
  const secret = JSON.parse(fs.readFileSync(path, 'utf8'));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

(async () => {
  const keypairPath = process.env.SOLANA_KEYPAIR || `${process.env.HOME}/.config/solana/id.json`;
  const payer = loadKeypair(keypairPath);
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const MINT = new PublicKey(process.env.USDC_MINT); // set env var USDC_MINT to the mint from step 1
  const ata = await getOrCreateAssociatedTokenAccount(connection, payer, MINT, payer.publicKey);
  console.log('ATA:', ata.address.toBase58());
})();
