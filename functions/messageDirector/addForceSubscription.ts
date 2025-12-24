import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole";
import { isBotAdmin } from "../IsBotAdmin";
import bot from "../../index";
import { Message } from "telegraf/types";
import forceSubscription from "../../models/forceSubscriptions.module";
import { updateLastMessage } from "../updateLastMessage";


export const addForceSubscription = async (ctx: Context) => {
    try {
        if (!ctx.message || !bot.botInfo || !ctx.from || !ctx.from.id) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const message = ctx.message.text;
        const botID = bot.botInfo.id;
        const isBotAdminOrNot = await isBotAdmin(message, botID)
        let newMessage: Message;
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