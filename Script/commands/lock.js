/**
 * @author VK. SAIM
 * @command lock
 * @description Lock/unlock a group in Mira Bot
 */

const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "lock",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "VK. SAIM",
  description: "Lock/unlock group to block non-admin messages",
  commandCategory: "Admin",
  usages: "lock | unlock | lockstatus",
  cooldowns: 2,
};

const LOCK_FILE = path.join(__dirname, "cache", "lock_state.json");

// Ensure storage
function ensureStorage() {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  if (!fs.existsSync(LOCK_FILE)) fs.writeFileSync(LOCK_FILE, JSON.stringify({}), "utf8");
}

function readLockMap() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(LOCK_FILE, "utf8") || "{}");
}

function writeLockMap(map) {
  fs.writeFileSync(LOCK_FILE, JSON.stringify(map, null, 2), "utf8");
}

// Check if sender is admin
async function isAdmin(api, threadID, userID) {
  try {
    const info = await api.getThreadInfo(threadID);
    if (!info || !info.adminIDs) return false;
    const adminIDs = info.adminIDs.map(a => (a.id ? a.id : a));
    return adminIDs.includes(userID.toString()) || adminIDs.includes(userID);
  } catch {
    return false;
  }
}

module.exports.run = async function({ api, event }) {
  try {
    ensureStorage();
    const lockMap = readLockMap();
    const threadID = event.threadID;
    const senderID = event.senderID;
    const msg = (event.body || "").trim().toLowerCase();

    // === COMMANDS ===
    if (msg === "/lock") {
      if (!await isAdmin(api, threadID, senderID)) return api.sendMessage("❌ শুধুমাত্র অ্যাডমিনরা লক করতে পারবে।", threadID, event.messageID);
      lockMap[threadID] = true;
      writeLockMap(lockMap);
      return api.sendMessage("🔒 গ্রুপ লক করা হয়েছে!", threadID, event.messageID);
    }

    if (msg === "/unlock") {
      if (!await isAdmin(api, threadID, senderID)) return api.sendMessage("❌ শুধুমাত্র অ্যাডমিনরা আনলক করতে পারবে।", threadID, event.messageID);
      delete lockMap[threadID];
      writeLockMap(lockMap);
      return api.sendMessage("🔓 গ্রুপ আনলক করা হয়েছে!", threadID, event.messageID);
    }

    if (msg === "/lockstatus") {
      const locked = !!lockMap[threadID];
      return api.sendMessage(locked ? "🔒 গ্রুপ বর্তমানে লক অবস্থায়।" : "🔓 গ্রুপ আনলক অবস্থায়।", threadID, event.messageID);
    }

    // === ENFORCEMENT ===
    if (lockMap[threadID]) {
      const botID = api.getCurrentUserID ? api.getCurrentUserID() : null;
      if (senderID == botID) return; // bot messages allowed
      if (await isAdmin(api, threadID, senderID)) return; // admins allowed
      // delete member message
      try {
        if (api.deleteMessage) await api.deleteMessage(event.messageID);
        else if (api.unsendMessage) await api.unsendMessage(event.messageID);
        else await api.sendMessage("⚠️ গ্রুপ লক আছে — মেসেজ অনুমোদন প্রয়োজন।", threadID);
      } catch(e) {
        console.warn("Failed to delete message:", e);
      }
    }

  } catch(err) {
    console.error("lock.js error:", err);
  }
};
