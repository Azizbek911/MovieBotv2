import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole";
import { updateLastMessage } from "../updateLastMessage";
import { Message } from "telegraf/types";
import extraLink from "../../models/extraLink.module";



export const removeExtraLink = async (ctx: Context) => {
    try {
        const message = ctx.message.text;
        let newMessage: Message;
        const isEmpty = await extraLink.findOne({ url: message });
        if (isEmpty) {
            await extraLink.deleteOne({ url: message });
            newMessage = await ctx.reply("✅ Link o'chirib tashlandi", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        } else {
            newMessage = await ctx.reply("⚠️ Kechirasiz, bu link mavjud emas:", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        }


        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Qo'shimcha link o'chirishda xatolik mavjud: ", ctx);
    }
}