import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole.ts";
import { Message } from "telegraf/types";
import extraLink from "../../models/extraLink.module.js";
import { updateLastMessage } from "../updateLastMessage.ts";


export const addExtraLink = async (ctx: Context) => {
    try {
        const message = ctx.message.text;
        let newMessage: Message;

        const isEmpty = await extraLink.findOne({ url: message });
        if (isEmpty) {
            newMessage = await ctx.reply("⚠️ Kechirasiz siz kiritgan link mavjud:", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        } else {
            await extraLink.create({ url: message })
            newMessage = await ctx.reply("✅ Siz kiritgan link kiritildi", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]))
        }
        await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        await errorConsole(err, "Qo'shimcha link qo'shishda xatolik mavjud", ctx)
    }
}