import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole.ts";
import { Message } from "telegraf/types";
import bot from "../../index.js";
import zayafka from "../../models/zayafka.module.js";
import { updateLastMessage } from "../updateLastMessage.ts";


export const addZayafka = async (ctx: Context) => {
    try {
        let newMessage:Message;
        const message = ctx.message.text;
        if (!ctx.session.id) {
            try {
                const isMember = await bot.telegram.getChatMember(message, ctx.botInfo.id);
                if (isMember.status === "administrator" || isMember.status === "creator") {
                    ctx.session.id = message;
                    newMessage = await ctx.reply("✅ Ajoyib, endi bu ID uchun link kiriting: ", Markup.inlineKeyboard([
                        [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                    ]));
                }
            } catch (err) {
                newMessage = await ctx.reply("⚠️ Iltimos, birinchi meni kanalda azo ekanligimga ishonch hosil qiling: ", Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]));
            }
        } else if (ctx.session.id) {
            const newLink = {
                id: ctx.session.id,
                url: message
            };
            const result = await zayafka.create(newLink);
            newMessage = await ctx.reply("✅ Yangi Zayafka kiritildi", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh sahifa", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        await errorConsole(err, "Zayafka qo'shishda xatolik mavjud:", ctx)
    }
};