const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const PORT = 3000;

// Konfigurasi Bot Telegram
const TELEGRAM_TOKEN = "7415682127:AAHszgkiRuVw6HN-UImksNzY-Iu1jGOyEMo";
const CHAT_ID = "5951232585";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Simulasi blockchain sederhana
let blockchain = [];
let difficulty = 4; // Mining difficulty
let blockReward = 50; // Block reward
let halvingInterval = 210000; // Halving setiap 210.000 blok
let currentBlock = 0;

// Fungsi Hashing (SHA-256)
function calculateHash(index, previousHash, timestamp, data, nonce) {
  return crypto
    .createHash("sha256")
    .update(index + previousHash + timestamp + data + nonce)
    .digest("hex");
}

// Proof of Work (PoW) Mining
function mineBlock(previousBlock, data) {
  let nonce = 0;
  let timestamp = Date.now();
  let previousHash = previousBlock.hash;
  let hash = "";

  console.log("🔨 Mining block...");
  while (!hash.startsWith("0".repeat(difficulty))) {
    nonce++;
    timestamp = Date.now();
    hash = calculateHash(currentBlock, previousHash, timestamp, data, nonce);
  }

  let newBlock = {
    index: currentBlock,
    timestamp,
    data,
    nonce,
    previousHash,
    hash,
    reward: blockReward,
  };

  currentBlock++;
  blockchain.push(newBlock);

  console.log("✅ Block Mined:", newBlock);
  return newBlock;
}

// Simulasi Mining Pool
function miningPool(miners) {
  let blocks = [];
  for (let i = 0; i < miners; i++) {
    blocks.push(mineBlock(blockchain.length ? blockchain[blockchain.length - 1] : { hash: "0000" }, `Miner ${i + 1}`));
  }
  return blocks;
}

// Halving Mechanism
function checkHalving() {
  if (currentBlock % halvingInterval === 0) {
    blockReward /= 2;
    console.log("🔥 Bitcoin Halving Terjadi! Hadiah Blok Baru:", blockReward);
    bot.sendMessage(CHAT_ID, `🔥 Bitcoin Halving! Hadiah Blok Baru: ${blockReward} BTC`);
  }
}

// API Endpoint untuk mining
app.get("/mine", (req, res) => {
  const newBlock = mineBlock(blockchain.length ? blockchain[blockchain.length - 1] : { hash: "0000" }, "Miner");
  checkHalving();
  res.json(newBlock);
});

// API Endpoint untuk mining pool
app.get("/pool", (req, res) => {
  const blocks = miningPool(5);
  checkHalving();
  res.json(blocks);
});

// API Hash Rate & Difficulty
app.get("/status", (req, res) => {
  res.json({ difficulty, blockReward, currentBlock });
});

// Start server
app.listen(PORT, () => console.log(`Server telah di mulai port ${PORT}`));
      
