import { errorConsole } from "../functions/errorConsole.ts";
import { Markup } from "telegraf";
import last_id from "../models/counter.module.js";
import { checkLastID, updateLastID } from "../functions/checkLastID.ts";
import bot from "../index.js";
import mainChannel from "../models/main.channel.module.js";
import Movie from "../models/movie.module.js";
import { clearSession } from "../functions/clearSession.ts";

export const onVideo = async (ctx) => {
    try {
        // ❌ Agar operation video bo'lmasa
        if (ctx.session?.operation !== "video") {
            return await ctx.reply(
                "🚫 Hozir video qabul qilmayman",
                Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ])
            );
        }

        // 📦 Session videos bo'sh bo'lsa initialize qilish
        if (!ctx.session.videos) ctx.session.videos = [];

        // 🎥 Yangi video qo'shish
        if (ctx.message?.video?.file_id) {
            ctx.session.videos.push(ctx.message.video.file_id);
            await ctx.reply(
                `✅ Film qabul qilindi\n\nQoldi: ${ctx.session.videos.length}/${ctx.session.movie_parts}`
            );
        }

        // Agar barcha qismlar kelgan bo'lsa
        if (ctx.session.videos.length === parseInt(ctx.session.movie_parts)) {

            // 🔢 ID olish
            let lastId = await last_id.findOne({ name: "counter" });

            if (!lastId) {
                await checkLastID();
                lastId = await last_id.findOne({ name: "counter" });
            }

            const {
                movie_name,
                janr,
                country,
                language,
                year,
                movie_type,
                videos
            } = ctx.session;

            // 📡 Kanalni topish
            const main_channel = await mainChannel.findOne({ channel: "mainChannel" });
            if (!main_channel || !main_channel.url) {
                return await ctx.reply("🚫 Kanal topilmadi yoki URL mavjud emas.");
            }

            let channel_movies = [];

            // 📤 Videolarni kanalga yuborish
            for (const fileId of videos) {
                const msg = await bot.telegram.sendVideo(
                    main_channel.url,
                    fileId
                );
                channel_movies.push(msg.message_id);
            }

            // 💾 Movie saqlash  ✅ TO‘G‘RILANDI
            const movieId = (lastId.lastID || 1);

            const newMovie = new Movie({
                id: movieId,
                name: movie_name,
                parts: parseInt(ctx.session.movie_parts),
                country,
                language,
                janr,
                year,
                isPremium: movie_type === "premium",
                videos: channel_movies
            });

            await newMovie.save();

            // 🧹 Session tozalash
            ctx.session = null;

            await ctx.reply(
                `🎬 Film muvaffaqiyatli saqlandi!\n\nFILM KODI: ${movieId}`,
                Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Admin panel", "admin_main")]
                ])
            );
            clearSession()
            await updateLastID();
        }

    } catch (err) {
        errorConsole(err, "Video yuklashda xatolik:", ctx);
    }
};
