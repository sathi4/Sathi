const fs = require('fs');
const path = require('path');

const coinsFile = path.join(__dirname, 'coins.json');

// Load or initialize coins data
let coinsData = {};
if (fs.existsSync(coinsFile)) {
    try {
        coinsData = JSON.parse(fs.readFileSync(coinsFile, 'utf-8'));
    } catch {
        coinsData = {};
    }
}

// Save coins
function saveCoins() {
    fs.writeFileSync(coinsFile, JSON.stringify(coinsData, null, 2));
}

module.exports.config = {
    name: "bet",
    version: "1.6.0",
    aliases: ["gamble", "slots"],
    credits: "VK. SAIM",
    description: "Simple Casino game with coins (Text only)",
    commandCategory: "fun",
    usages: "{pn} [coin|slot]",
    hasPermssion: 0
};

module.exports.run = async ({ api, event, args }) => {
    if (!args[0]) return api.sendMessage("❌ Please choose a game: coin or slot\nExample: bet coin", event.threadID, event.messageID);

    const game = args[0].toLowerCase();

    // initialize coins
    if (!coinsData[event.senderID]) {
        if (event.senderID === "61566961113103") {
            coinsData[event.senderID] = 100000000; // Admin coins
        } else {
            coinsData[event.senderID] = 100; // normal users start
        }
    }

    let coins = coinsData[event.senderID];
    let resultText = "";

    if (game === "coin") {
        const outcome = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
        const win = Math.random() < 0.5;

        if (win) {
            coins += 20;
            resultText = `🎲 Coin Flip Result: ${outcome}\n🎉 You Win! +20 coins`;
        } else {
            coins -= 15;
            resultText = `🎲 Coin Flip Result: ${outcome}\n😢 You Lose! -15 coins`;
        }

    } else if (game === "slot") {
        const emojis = ["🍒","🍋","🍉","🍇","⭐"];
        const slot1 = emojis[Math.floor(Math.random()*emojis.length)];
        const slot2 = emojis[Math.floor(Math.random()*emojis.length)];
        const slot3 = emojis[Math.floor(Math.random()*emojis.length)];

        if (slot1 === slot2 && slot2 === slot3) {
            coins += 500;
            resultText = `🎰 Slot Result: ${slot1} | ${slot2} | ${slot3}\n🎉 Jackpot! +500 coins`;
        } else if (slot1===slot2 || slot2===slot3 || slot1===slot3) {
            coins += 50;
            resultText = `🎰 Slot Result: ${slot1} | ${slot2} | ${slot3}\n✨ Small Win! +50 coins`;
        } else {
            coins -= 15;
            resultText = `🎰 Slot Result: ${slot1} | ${slot2} | ${slot3}\n😢 You Lose! -15 coins`;
        }

    } else {
        return api.sendMessage("❌ Invalid game. Choose 'coin' or 'slot'.", event.threadID, event.messageID);
    }

    // save coins
    coinsData[event.senderID] = coins;
    saveCoins();

    return api.sendMessage(`${resultText}\n💰 Your Current Coins: ${coins}`, event.threadID, event.messageID);
};
