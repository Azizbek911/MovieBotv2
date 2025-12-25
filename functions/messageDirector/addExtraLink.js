import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import extraLink from "../../models/extraLink.module.js";
import { updateLastMessage } from "../updateLastMessage.js";


export const addExtraLink = async (ctx) => {
    try {
        const message = ctx.message.text;
        let newMessage;

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