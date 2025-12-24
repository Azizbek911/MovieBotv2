import { Telegraf } from "telegraf";
import { TOKEN } from "./config/env.js";

const bot = new Telegraf(TOKEN);
const CHANNEL_ID = "-1002403291426"; // yoki -100xxxxxxxxxx

// 🔹 hozircha soxta izoh
const DUMMY_TEXT = `
🎬 Kino nomi: Test Movie
📅 Yil: 2024
⭐ Reyting: 8.5/10

📝 Izoh:
Bu hozircha dummy text.
Keyin DB dan olinadi.
`;

/**
 * VIDEO QABUL QILISH
 */
bot.on("video", async (ctx) => {
    try {
        const sent = await ctx.telegram.sendVideo(
            CHANNEL_ID,
            ctx.message.video.file_id
        );

        const movieId = sent.message_id;

        await ctx.reply(
            `✅ Kino saqlandi!\n\n🎞 Kino ID: ${movieId}\n\nOlish:\n/get ${movieId}`
        );
    } catch (e) {
        console.error(e);
        ctx.reply("❌ Video saqlashda xatolik");
    }
});

/**
 * KINONI OLIB BERISH (FORWARD YO‘Q)
 */
bot.on("message", async (ctx) => {
    const id = Number(ctx.message.text);
    if (!id) return ctx.reply("❌ To‘g‘ri ID kiriting");

    try {
        // 1️⃣ Izohni alohida message qilib yuboramiz
        await ctx.reply(DUMMY_TEXT);
        // 2️⃣ Videoni forward belgisiz ko‘chiramiz
        await ctx.telegram.copyMessage(
            ctx.chat.id,
            CHANNEL_ID,
            id
        );


    } catch (e) {
        console.error(e);
        ctx.reply("❌ Kino topilmadi yoki o‘chirilgan");
    }
});

bot.launch();
