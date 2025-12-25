import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import { isBotAdmin } from "../IsBotAdmin.js";
import bot from "../../index.js";
import forceSubscription from "../../models/forceSubscriptions.module.js";
import { updateLastMessage } from "../updateLastMessage.js";


export const addForceSubscription = async (ctx) => {
    try {
        if (!ctx.message || !bot.botInfo || !ctx.from || !ctx.from.id) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const message = ctx.message.text;
        const botID = bot.botInfo.id;
        const isBotAdminOrNot = await isBotAdmin(message, botID)
        let newMessage;
        if (isBotAdminOrNot === true) {
            const isEmpty = await forceSubscription.findOne({ url: message });
            if (isEmpty) {
                newMessage = await ctx.reply("Kechirasiz siz bu majburiy obunani oldin ham qo'shgansiz: ", Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                ]))
            } else {
                const result = await forceSubscription.create({ url: message });
                newMessage = await ctx.reply(`✅ Siz kiritgan majburiy obuna muvofiqiyatli kiritildi\n\nMajbur obuna: ${message}`,  Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                ]));
            }
        } else {
            newMessage = await ctx.reply("⚠️ Iltimos botni kanalda azo va admin ekanligiga ishonch hosil qiling!", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        errorConsole(err, "Majburiy obuna yaratishda muamo bor:", ctx)
    }
};