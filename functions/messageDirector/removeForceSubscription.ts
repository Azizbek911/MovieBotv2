import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole"
import forceSubscription from "../../models/forceSubscriptions.module";
import { Message } from "telegraf/types";
import { updateLastMessage } from "../updateLastMessage";



export const removeForceSubscription = async (ctx: Context) => {
    try {
        if (!ctx.message || !ctx.from || !ctx.from.id) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const message = ctx.message.text;
        const isEmpty = await forceSubscription.findOne({ url: message });
        let newMessage: Message;
        if (isEmpty) {
            await forceSubscription.deleteOne({ url: message });
            newMessage = await ctx.reply("Siz yuborgan majburiy obuna o'chirib tashlandi!", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]))
        } else {
            newMessage = await ctx.reply(`Kechirasiz siz bu ${message} majburiy obunani kiritmagansiz!`, Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]))
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Majburiy obuna o'chirishda xatolik mavjud:", ctx)
    }
}