const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const coinsFile = path.join(__dirname, 'coins.json');

// Load or initialize coins data
let coinsData = {};
if (fs.existsSync(coinsFile)) {
    coinsData = JSON.parse(fs.readFileSync(coinsFile, 'utf-8'));
} else {
    fs.writeFileSync(coinsFile, JSON.stringify({}));
}

module.exports.config = {
    name: "bet",
    version: "1.4.0",
    aliases: ["gamble", "slots"],
    credits: "VK. SAIM",
    description: "Casino game with coins, showing user name, profile picture, and result",
    commandCategory: "fun",
    usages: "{pn} [coin|slot]",
    hasPermssion: 0
};

// Utility: update coins file
function updateCoins() {
    fs.writeFileSync(coinsFile, JSON.stringify(coinsData, null, 2));
}

// Generate casino result image
async function generateCasinoImage(username, profilePicUrl, resultText, coins) {
    const canvas = createCanvas(500, 350);
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 500, 350);

    // profile picture
    let avatar;
    try { avatar = await loadImage(profilePicUrl); } catch { avatar = null; }
    if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(70, 70, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 20, 20, 100, 100);
        ctx.restore();
    }

    // username
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(username, 150, 60);

    // result text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(resultText, 250, 180);

    // coins
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`Coins: ${coins}`, 250, 280);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('bet_result.png', buffer);
    return fs.createReadStream('bet_result.png');
}

module.exports.run = async ({ api, event, args }) => {
    if (!args[0]) return api.sendMessage("❌ Please choose a game: coin or slot\nExample: bet coin", event.threadID, event.messageID);
    const game = args[0].toLowerCase();

    // get user info
    let userName = "Player";
    let userAvatar = null;
    try {
        const userInfo = await api.getUserInfo(event.senderID);
        const user = userInfo[event.senderID];
        userName = user.name;
        userAvatar = user.profileUrl || user.avatar || null;
    } catch {}

    // initialize user's coins if not exists
    if (!coinsData[event.senderID]) {
        if (event.senderID == "61566961113103") {
            coinsData[event.senderID] = 100000000; // Admin starts with 100,000,000 coins
        } else {
            coinsData[event.senderID] = 100; // normal users start with 100 coins
        }
    }

    let coins = coinsData[event.senderID];
    let resultText = "";

    if (game === "coin") {
        const outcome = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
        const win = Math.random() < 0.5;

        if (win) {
            coins += 20; // win 20 coins
            resultText = `${outcome} | You Win! 🎉`;
        } else {
            coins -= 15; // lose 15 coins
            resultText = `${outcome} | You Lose! 😢`;
        }

    } else if (game === "slot") {
        const emojis = ["🍒", "🍋", "🍉", "🍇", "⭐"];
        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

        if (slot1 === slot2 && slot2 === slot3) {
            coins += 500; // Jackpot coins
            resultText = `${slot1} | ${slot2} | ${slot3}\nJackpot! 🎉`;
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            coins += 50; // Small win
            resultText = `${slot1} | ${slot2} | ${slot3}\nSmall Win! ✨`;
        } else {
            coins -= 15; // Lose
            resultText = `${slot1} | ${slot2} | ${slot3}\nYou Lose! 😢`;
        }

    } else {
        return api.sendMessage("❌ Invalid game. Choose 'coin' or 'slot'.", event.threadID, event.messageID);
    }

    // update coins
    coinsData[event.senderID] = coins;
    updateCoins();

    // generate image
    const img = await generateCasinoImage(userName, userAvatar, resultText, coins);
    return api.sendMessage({ body: "🎲 Bet Result:", attachment: img }, event.threadID, () => fs.unlinkSync('bet_result.png'), event.messageID);
};
