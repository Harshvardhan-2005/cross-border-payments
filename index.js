const express = require("express");
const { encodeURL } = require("@solana/pay");
const { PublicKey } = require("@solana/web3.js");
const BigNumber = require("bignumber.js");
const QRCode = require("qrcode");

const app = express();
const port = 3000;

// Serve static frontend files
app.use(express.static(__dirname));

// Devnet wallet address
const recipient = new PublicKey("HFwvAqSege3rhaDdNRxPpUnqZEZaLkPYzg7iZnWCgF4p");

// Fixed conversion rate: 1 INR = 0.012 USD (for testing)
function getUSDfromINR(inrAmount) {
  return inrAmount * 0.012;
}

// Endpoint to generate QR code
app.get("/pay/:inr", async (req, res) => {
  try {
    const inrAmount = Number(req.params.inr);
    if (isNaN(inrAmount) || inrAmount <= 0) {
      return res.status(400).send("<p>Invalid INR amount</p>");
    }

    const usdAmount = getUSDfromINR(inrAmount);
    const usdcAmount = new BigNumber(usdAmount.toFixed(6));

    const url = encodeURL({
      recipient,
      amount: usdcAmount,
      label: "Cross-Border Payment",
      message: `Paying ${inrAmount} INR (~${usdAmount.toFixed(2)} USD)`
    });

    const qrImage = await QRCode.toDataURL(url.toString());

    res.send(`
      <h1>Scan to Pay</h1>
      <p>Pay ${inrAmount} INR (~${usdAmount.toFixed(2)} USD) in USDC (Devnet)</p>
      <img src="${qrImage}" />
      <p>Or open in wallet: <a href="${url.toString()}">${url.toString()}</a></p>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send(`<p>Something went wrong: ${err.message}</p>`);
  }
});

app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));