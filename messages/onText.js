import bot from "../index.js";
import { errorConsole } from "../functions/errorConsole.js";
import mainChannel from "../models/main.channel.module.js";
import movie from "../models/movie.module.js";
import { Markup } from "telegraf";

// Rate limitlarni boshqarish uchun konstantalar
const RATE_LIMIT_DELAY = 1200; // ms (1.2 soniya - Telegram limitidan biroz uzunroq)
const MAX_RETRIES = 3; // Qayta urinishlar soni

// Xatolik bilan qayta urinish funksiyasi
async function sendWithRetry(sendFunction, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            return await sendFunction();
        } catch (error) {
            if (error.response && error.response.error_code === 429) {
                // Rate limit xatosi - kutish va keyin qayta urinish
                const retryAfter = error.response.parameters?.retry_after || RATE_LIMIT_DELAY;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            throw error; // Boshqa xatolar
        }
    }
    throw new Error(`Max retries (${retries}) exceeded`);
}

// Kutish funksiyasi
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const onText = async (ctx, next) => {
    try {
        // Sessiya operatsiyasini tekshirish
        if (ctx.session?.operation) {
            return next();
        } else {
            // Inputni tekshirish
            const messageId = parseInt(ctx.message.text);
            if (isNaN(messageId)) {
                return await ctx.reply("🤕 Iltimos, menga raqam yuboring");
            }

            // Kinoni bazadan olish
            const movies = await movie.findOne({ id: messageId });
            if (!movies) {
                return await ctx.reply(
                    `😓 Kechirasiz, ${messageId} raqami bilan film topilmadi\n\n` +
                    `😁 Iltimos, boshqa raqamni sinab ko'ring`
                );
            }

            // Kanal ma'lumotlarini olish
            const channel = await mainChannel.findOne({ channel: "mainChannel" });
            if (!channel) {
                return await ctx.reply("❌ Texnik muammo: Asosiy kanal topilmadi");
            }

            // Tavsifni tayyorlash
            const genreText = movies.janr?.trim()
                ? `🎭 Janr: ${movies.janr}`
                : "🎭 Janr: Mavjud emas";

            const description =
                `🎬 Nomi: ${movies.name || "Noma'lum"}\n` +
                `${genreText}\n` +
                `🎞 Qismlar: ${movies.parts || 0} ta\n` +
                `🌍 Davlat: ${movies.country || "Noma'lum"}\n` +
                `🌐 Til: ${movies.language || "Noma'lum"}\n` +
                `📅 Yil: ${movies.year || "Noma'lum"}\n` +
                `👀 Ko'rganlar: ${movies.views?.length || 0}\n` +
                `👍🏻 Yoqtirganlar: ${movies.likes?.length || 0}\n` +
                `👎 Yoqtirmaganlar: ${movies.dislikes?.length || 0}`;

            // Tugmalarni yaratish
            const buttons = Markup.inlineKeyboard([
                [
                    Markup.button.callback("👍🏻 Yoqdi", "like"),
                    Markup.button.callback("👎 Yoqmadi", "dislike")
                ],
                [Markup.button.callback("💾 Saqlash", "save_movie")]
            ]);

            // Asosiy jo'natish logikasi
            if (movies.videos?.length === 1) {
                // Bitta video uchun - hamma narsa bir xabarda
                await sendWithRetry(() =>
                    bot.telegram.copyMessage(
                        ctx.chat.id,
                        channel.url,
                        movies.videos[0],
                        {
                            caption: description,
                            parse_mode: "HTML",
                            reply_markup: buttons.reply_markup
                        }
                    )
                );
            } else if (movies.videos?.length > 1) {
                // Bir nechta video uchun - ketma-ket jo'natish

                // 1. Tavsifni jo'natish
                await sendWithRetry(() => ctx.reply(description));
                await delay(RATE_LIMIT_DELAY);

                // 2. Videolarni ketma-ket jo'natish
                for (let i = 0; i < movies.videos.length; i++) {
                    await sendWithRetry(() =>
                        bot.telegram.copyMessage(ctx.chat.id, channel.url, movies.videos[i])
                    );

                    // Oxirgi video bo'lmaganda kutish
                    if (i < movies.videos.length - 1) {
                        await delay(RATE_LIMIT_DELAY);
                    }
                }

                await delay(RATE_LIMIT_DELAY);

                // 3. Tugmalarni jo'natish
                await sendWithRetry(() =>
                    ctx.reply("Sizga kino yoqdimi: ", buttons)
                );
            } else {
                // Video bo'lmasa
                await ctx.reply(
                    `${description}\n\n⚠️ Bu film uchun videolar hozircha mavjud emas.`
                );
            }

            // Session va ko'rish statistikasini yangilash
            ctx.session.movieID = messageId;

            if (!movies.views.includes(ctx.from.id)) {
                movies.views.push(ctx.from.id);
                await movies.save();
            }
        }



    } catch (err) {
        // Xatolarni qayta ishlash
        await errorConsole(err, "Film olishda xatolik mavjud: ", ctx);

        // Foydalanuvchiga tushunarli xabar
        if (err.message.includes("retries") || err.response?.error_code === 429) {
            await ctx.reply(
                "⚠️ Server hozir band. Iltimos, bir necha soniyadan keyin qayta urinib ko'ring."
            );
        } else {
            await ctx.reply("❌ Kechirasiz, xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
        }
    }
};