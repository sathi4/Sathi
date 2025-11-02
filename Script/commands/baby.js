const axios = require("axios");
const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
 name: "baby",
 version: "1.0.3",
 hasPermssion: 0,
 credits: "ULLASH",
 description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
 commandCategory: "simsim",
 usages: "[message/query]",
 cooldowns: 0,
 prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
 try {
 const uid = event.senderID;
 const senderName = await Users.getNameUser(uid);
 const rawQuery = args.join(" "); 
 const query = rawQuery.toLowerCase(); 

 if (!query) {
 const ran = ["Bolo baby", "hum"];
 const r = ran[Math.floor(Math.random() * ran.length)];
 return api.sendMessage(r, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 });
 }

 const command = args[0].toLowerCase();
 
 if (["remove", "rm"].includes(command)) {
 const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
 if (parts.length < 2)
 return api.sendMessage(" | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "list") {
 const res = await axios.get(`${simsim}/list`);
 if (res.data.code === 200) {
 return api.sendMessage(
 `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\n☠︎︎ Developer: ${res.data.author}`,
 event.threadID, event.messageID
 );
 } else {
 return api.sendMessage(`Error: ${res.data.message || "Failed to fetch list"}`, event.threadID, event.messageID);
 }
 }

 if (command === "edit") {
 const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
 if (parts.length < 3)
 return api.sendMessage(" | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
 const [ask, oldReply, newReply] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "teach") {
 const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
 if (parts.length < 2)
 return api.sendMessage(" | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

 const [ask, ans] = parts.map(p => p.trim());
 
 const groupID = event.threadID; 
 let groupName = event.threadName ? event.threadName.trim() : ""; 
 
 if (!groupName && groupID != uid) {
 try {
 const threadInfo = await api.getThreadInfo(groupID);
 if (threadInfo && threadInfo.threadName) {
 groupName = threadInfo.threadName.trim();
 }
 } catch (error) {
 console.error(`Error fetching thread info for ID ${groupID}:`, error);
 }
 }

 let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
 
 if (groupName) {
 teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
 }

 const res = await axios.get(teachUrl);
 return api.sendMessage(`${res.data.message || "Reply added successfully!"}`, event.threadID, event.messageID);
 }

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const reply of responses) {
 await new Promise((resolve) => {
 api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }
 } catch (err) {
 console.error(err);
 return api.sendMessage(`| Error in baby command: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
 try {
 const senderName = await Users.getNameUser(event.senderID);
 const replyText = event.body ? event.body.toLowerCase() : "";
 if (!replyText) return;

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
 const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const reply of responses) {
 await new Promise((resolve) => {
 api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 }
 );
 }
 } catch (err) {
 console.error(err);
 return api.sendMessage(` | Error in handleReply: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
 try {
 const raw = event.body ? event.body.toLowerCase().trim() : "";
 if (!raw) return;
 const senderName = await Users.getNameUser(event.senderID);
 const senderID = event.senderID;

 if (
 raw === "baby" || raw === "bot" || raw === "bby" ||
 raw === "oii" || raw === "oi" || raw === "জান" || raw === "বট" || raw === "বেবি" 
 ) {
 const greetings = [
 "Bolo baby 💬", "হুম? বলো 😺", "হ্যাঁ জানু 😚", "শুনছি বেবি 😘", "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈", "⎯͢🫶😌🙂⎯⃝শু্ঁন্ঁলা্ঁম্ঁ এ্ঁই্ঁ, গু্ঁরু্ঁপে্ঁর্ঁ এ্ঁড্ঁমি্ঁন্ঁ না্ঁকি্ঁ ক্ঁট্ঁ খা্ঁই্ঁছে্ঁ༎⎯͢⎯⃝🙄🍒🥂🌷", "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘", "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣", "jang hanga korba😒😬", "আমাকে না ডেকে আমার বস ছাইম কে একটা জি এফ দাও-😽🫶🌺", "মাইয়া হলে চিপায় আসো 🙈😘", "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমাকে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করাছে-🥲🤦‍♂️🤧", "-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️", "বট বট করিস না তো 😑,মেয়ে হলে আমার ছাইম বসের ইনবক্স এ গিয়ে উম্মা দিয়ে আসো , এই নাও বসের ইনবক্স লিংক m.me/61566961113103", "এত ডাকাডাকি না করে মুড়ির সাথে গাঞ্জা মিশাইয়া খাইয়া মরে যা", "—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস ছাইম এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸", "সুন্দর মাইয়া মানেই-🥱আমার বস ছাইম' এর বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸", "-𝗜 𝗟𝗢𝗩𝗢 𝗬𝗢𝗨-😽-আহারে ভাবছো তোমারে প্রোপজ করছি-🥴-থাপ্পর দিয়া কিডনী লক করে দিব-😒-ভুল পড়া বের করে দিবো-🤭🐸", "-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧", "আজ থেকে আর কাউকে পাত্তা দিমু না -!😏-কারণ আমি ফর্সা হওয়ার ক্রিম কিনছি -!🙂🐸", "তোগো গ্রুপের এড়মিন রাতে বিছানায় মুতে🤧🤓", "দূরে যা, তোর কোনো কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣", "অনুমতি দিলে 𝚈𝚘𝚞𝚃𝚞𝚋𝚎-এ কল দিতাম..!😒", "ওই কিরে গ্রুপে দেখি সব বুইড়া বুইড়া বেড়ি 🤦🏼🍼", "বন্ধুর সাথে ছেকা খাওয়া গান শুনতে শুনতে-🤧 -এখন আমিও বন্ধুর 𝙴𝚇 কে অনেক 𝙼𝙸𝚂𝚂 করি-🤕", " পুরুষকে সবচেয়ে বেশি কষ্ট দেয় তার শখের নারী...!🥺💔", "তোমার লগে দেখা হবে আবার - 😌 -কোনো এক অচেনা গলির চিপায়..!😛🤣", "•-কিরে🫵 তরা নাকি prem করস..😐🐸•আমারে একটা করাই দিলে কি হয়-🥺", "-প্রিয়-🥺 -তোমাকে না পেলে আমি সত্যি-😪 -আরেকজন কে-😼 -পটাতে বাধ্য হবো-😑🤧", "তোর কি চোখে পড়ে না আমি বস ছাইম এর সাথে ব্যাস্ত আসি😒", "মাইয়া হলে আমার বস ছাইম কে Ummmmha দে 😒, এই নে বসের আইড়ি https://www.facebook.com/61566961113103", "- শখের নারী বিছানায় মু'তে..!🙃🥴", "বার বার Disturb করেছিস কোনো😾,আমার বস ছাইম এর এর সাথে ব্যাস্ত আসি😋", "আমি গরীব এর সাথে কথা বলি না😼", "কিরে বলদ এত ডাকাডাকি করিস কেনো 🐸, তোরে কি শয়তানে লারে ??", "᛫──⃜͢͢🍒͟͟͞͞๛⃝≛⃝কে্ঁম্ঁন্ঁ ডা্ঁ লা্ঁগে্ঁ কি্ঁছু্ঁতে্ঁই্ঁ এ্ঁক্ঁটা্ঁ প্রে্ঁম্ঁ হ্ঁচ্ছে্ঁঁ না্ঁ⎯⃝💚🙊🫰✿⃝༉༐༐🍒🫂", "⎯⃝😒বা্ঁচা্ঁও্ঁ বা্ঁচা্ঁও্ঁ প্রে্ঁমে্ঁ প্ঁরে্ঁ গে্ঁলা্ঁম্ঁ ✿•⎯͢⎯⃝🙄🪽🪄💜✨", "⃟⃝𝄟𝄞জু্ঁতা্ঁ চি্ঁনো্ঁ জু্ঁতা্ঁ আ্ঁমা্ঁর্ঁ টা্ঁ ছি্ঁড়েৃঁ গে্ঁছে্ঁ😩😩 🙄 ⃟⃝𝄟𝄞🤢😼", "𝄞⋆⃝🌼⋆⃝জাঁনঁ𝄞🌼⋆⃝চঁলোঁ 𝄞🌼⋆⃝পাঁলাঁইঁ⋆⃝🌼⋆⃝𝄞🙈", "♡⎯͢⎯⃝,😬 তো্ঁমা্ঁদে্ঁর্ঁ GÇ তে্ঁ ĀC না্ঁই্ঁ ছি্ঁহ্ঁ⎯⃝😑🤣", "⎯͢⎯⃝😘🩵 চা্ঁ এ্ঁর্ঁ সা্ঁথে্ঁ লে্ঁবু্ঁ 🍋𝑰 𝑳𝒐𝒗𝒆 𝒀𝒐𝒖 বা্ঁবু্ঁ‌⎯͢⎯⃝🌺💚", "─⃜⃜͢͢⎼⎼⎼⃡⃝⃨এ্ঁক্ঁটা্ঁ’ই্ঁ জী্ঁব্ঁন্ঁ তা্ঁও্ঁ আ্ঁবা্ঁর্ঁ অ’বি্ঁবা্ঁহি্ঁত্ঁ-😩─⃜⃜͢͢⎼⎼🐸", "𝄟≛⃝💚শৃ্ঁয়ৃ্ঁতাৃ্ঁনেৃ্ঁরৃ্ঁ নাৃ্ঁনিৃ্ঁ🥴𝄟≛⃝💚", "⎯͢⎯⃝ꪜ🪽 𝙸 𝙻𝚘𝚟𝚎 𝚄  মা্ঁয়া্ঁ লা্ঁগ্ঁলে্ঁ রি্ঁপ্লা্ঁই্ঁ দি্ঁও্ঁ🫣🫣⎯͢⎯⃝🍒", "𝒜ᴍɪ পড়ে গেছি 𝒯ᴏᴍᴀʀ প্রেমেℬᴀʙᴜ", "─༅༎༅💙🌼🩷༅༎༅─কেউ না নাড়া দিসনা দেখতে দে ༅༎ 😽💚🥀", "🌻🐰☹️༅😒࿐⍣⃝✿─𝐏𝐫𝐨𝐩𝐨𝐬𝐞 করবি নাকি থাপ্পাড় -😇🤦‍♀️⍣⃝★─মাইরা দৌড় দিমু__🏃‍♀😾༅😒࿐🌷 🌷", "⎯⃝🙂༏༏”♡আ্ঁমি্ঁ কা্ঁরো্ঁ প্রিয় না্ঁ ❖═✿⃟ 🌺❤️‍🩹", "❥⃝ʚ নি্ঁষ্পা্ঁপ্ঁ❥⃝যৌ্ঁব্ঁন্ঁ❥⃝আ্ঁমা্ঁর্ঁ❥⃝ʚ😌", "জা্ঁন্ঁ এ্ঁই্ঁ শ্ঁহ্ঁর্ঁ তো্ঁমা্ঁর্ঁ আ্ঁর্ঁ আ্ঁমা্ঁর্ঁ 🤭🤭", "⃝🦋⃝𝐈  𝐋𝐨𝐯𝐞 𝐘𝐨𝐮🌹ক্ঁই্ঁবা্ঁ না্ঁকি্ঁ কি্ঁল্ঁ দি্ঁমু✊💋💋🦴🌺⃝🫣", "𝄞 ⋆⃝💚❈┄😹 অ্ঁনু্ঁম্ঁতি্ঁ দি্ঁলে্ঁ ভ্ঁন্ডা্ঁমি্ঁ শু্ঁরু্ঁ ক্ঁর্ঁতা্ঁম্ঁ🙁𝄞⋆⃝🌺❈┄", "•ꕥ̳̳̳̳̳̳̳̿̿̿̿̿ꔷ⃟➤⃟♥  গুরুত্ব ন| পেলে দূরত্ব ব|ড়|ও-!!🖤🌹   ❥一ཐི༏ཋྀ࿐", "_জীবনে একাকিত্ব'ই 𝐁𝐞𝐬𝐭-♡︎🩷🪽", "𝚘𝐢𝐢-ইত্তু 🤏 ভালু’পাসা দিবা-🫣🥺", "┄┉𝄟⃟≛⃝❤️বে্ঁবি্ঁ কা্ঁম্ঁ টু্ঁ মা্ঁই্ঁ চি্ঁপা্ঁ ≛⃝🙊🥶𝄟 ☀︎︎", "⎯͢⎯⃝🩵😹স্ঁব্ঁ পা্ঁরি্ঁ কি্ঁন্তু্ঁ কা্ঁউ্ঁকে্ঁ প্ঁটা্ঁতে্ঁ পা্ঁরি্ঁ না্ঁহঁ⎯͢⎯⃝🩷🍒🙂", "⎯͢⎯⃝🌚— _'ভা্ঁল্লা্ঁগে্ঁ না্ঁ রে্ঁ ম্ঁন্ঁ খা্ঁলি্ঁ পি্ঁরি্ঁত্ঁ পি্ঁরি্ঁত্ঁ ক্ঁরে্ঁ 🙈🥴😒⎯͢⎯⃝★⎯͢⎯⃝🌚", "🌻♡︎⎯͢⎯‎‎‎‎‎‎★😒👍🏻না্ঁম্ঁ কি্ঁ_ব্ঁল্ঁ তা্ঁবি্ঁজ্ঁ ক্ঁর্ঁর্মু্ঁ😞🐸🫶🏻♡︎⎯͢⎯‎‎‎‎‎‎", "•⏤⵿⵿꤫꤫⛦⃕͜𝄟͢•๋❀͢🫂•আৃঁয়ঁ লাৃঁ  থিৃঁ মেৃঁরেৃঁ উৃঁগাৃঁন্ডাৃঁ পাৃঁঠিঁয়েৃঁ দেৃঁইৃঁ👀◡̈⃝ ا۬͢😁᪳𝆺꯭𝅥⎯꯭꯭᪵̽⎯꯭", "আ্ঁপ্ঁনি্ঁ যে্ঁ লু্ঁচ্চা্ঁ আ্ঁগে্ঁই্ঁ জা্ঁন্ঁতা্ঁম্ঁ  ⎯⃝🥺😁", "⎯͢⎯⃝❥︎🐹ও্ঁই্ঁ শু্ঁনো্ঁ না্ঁ জা্ঁমা্ঁই্ঁ হ্ঁবা্ঁ𝄞⋆⃝❤️✿⎯͢⎯", "𝄟⃟≛⃝💙প্রে্ঁমের্ঁ ও্ঁষু্ঁধ্ঁ খে্ঁতে্ঁ হ্ঁবে্ঁ💙⃝⃝😁ꔹ⃟𝄟", "আ্ঁমা্ঁরে্ঁ এ্ঁক্ঁটু্ঁ ভা্ঁলো্ঁবা্ঁসা্ঁ যা্ঁয়্ঁ না্ঁ বে্ঁশি্ঁ না্ঁ অ্ঁল্প্ঁ এ্ঁক্ঁটু্ঁ☹️😩", "𝄞 ⋆⃝🌚❈┄🐸 অ্ঁনু্ঁম্ঁতি্ঁ দি্ঁলে্ঁ গুঁরু্পে্ঁ এ্কঁটা বোম্ঁ মারতাৃমঁ🐸𝄞⋆⃝🌺❈┄", "😐⎯͢⎯⃝🫵♡ম্ঁন্ঁ দি্ঁবি্ঁ না্ঁকি্ঁ পু্ঁলি্ঁশ্ঁ ডা্ঁক্ঁদি্ঁমু্ঁ🐸🙊🍒___⎯͢⎯⃝🩷", "⎯🙂🙂বে্ঁয়া্ঁদ্ঁবি্ঁ মা্ঁপ্ঁ ক্ঁর্ঁবে্ঁন্ঁ🫡আ্ঁপ্ঁনা্ঁকে্ঁ এ্ঁক্ঁটা্ঁ থা্ঁপ্প্ঁর্ঁ মা্ঁর্ঁতে্ঁ চা্ঁই্ঁ 🫢💙🪽",
 ];
 const randomReply = greetings[Math.floor(Math.random() * greetings.length)];

 const mention = {
 body: `${randomReply} @${senderName}`,
 mentions: [{
 tag: `@${senderName}`,
 id: senderID
 }]
 };

 return api.sendMessage(mention, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 }, event.messageID);
 }

 if (
 raw.startsWith("baby ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
 raw.startsWith("oii ") || raw.startsWith("oi ") ||
 raw.startsWith("জান ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
 ) {
 const query = raw
 .replace(/^baby\s+|^bot\s+|^bby\s+|^oii\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i, "")
 .trim();
 if (!query) return;

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const reply of responses) {
 await new Promise((resolve) => {
 api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }
 }
 } catch (err) {
 console.error(err);
 return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
 }
};
