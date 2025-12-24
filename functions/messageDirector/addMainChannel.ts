import { Context, Markup } from "telegraf";
import { Message } from "telegraf/types";
import { errorConsole } from "../errorConsole";
import mainChannel from "../../models/main.channel.module";
import { isBotAdmin } from "../IsBotAdmin";
import bot from "../../index";
import { admin } from "../buttons/userButtons";
import { updateLastMessage } from "../updateLastMessage";


export const addMainChannel = async (ctx: Context, message: string, newMessage: Message) => {
    try {
        if (!ctx || !ctx.from || !bot || !bot.botInfo) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const isMainChannelEmpty = await mainChannel.findOne({ channel: "mainChannel" });
        const botID = bot.botInfo.id;
        const isBotAdminOrNot = await isBotAdmin(message, botID);
        if (isMainChannelEmpty) {
            newMessage = await ctx.reply("⚠️ Kechirasiz sizda asosiy kanal mavjud, va siz uni faqat bir marta kirita olasiz!", Markup.inlineKeyboard(admin))
            delete ctx.session.operation;
            delete ctx.session.back;
        } else {
            if (isBotAdminOrNot === true) {
                await mainChannel.create({ channel: "mainChannel", url: message });
                newMessage = await ctx.reply("Kanal muvofiqyatli ulandi!", Markup.inlineKeyboard(admin));
                delete ctx.session.operation;
                delete ctx.session.back;
            } else {
                newMessage = await ctx.reply("⚠️ Iltimos botni kanalda azo va admin ekanligiga ishonch hosil qiling!", Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                ]));
            }
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Asosiy kanal qo'shishda xatolik mavjud:", ctx);
    }
}