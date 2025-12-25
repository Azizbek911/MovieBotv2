import { Markup } from "telegraf"
import { errorConsole } from "../errorConsole.js"


export const messageSender = async (ctx) => {
    try {
        let newMessage;
        ctx.session.message_id = ctx.message?.message_id;
        await ctx.telegram.forwardMessage(ctx.chat.id, ctx.chat?.id, ctx.session.message_id);
        newMessage = await ctx.reply("Xabaringiz qabul qilindi, xabarni jo'natishimimni hohleysizmi: ", Markup.inlineKeyboard([
            [Markup.button.callback("✅ HA", "yes_message_sender"), Markup.button.callback("❌ YOQ", "admin_main")],
            [Markup.button.callback("❌ Bekor qilish", "admin_main")]
        ]))
    } catch (err) {
        errorConsole(err, "Xaabar jo'natishda xatolik mavjud:", ctx)
    }
}