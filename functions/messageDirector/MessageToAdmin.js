import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";


export const messageToAdmin = async (ctx, OWNER, message) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start")
        const adminMessage = `📩 Yangi xabar!\n\n👤 Foydalanuvchi: ${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ""} (ID: ${ctx.from.id})\nUsername: @${ctx.from.username || ""}\n\n✉ Xabar matni:\n${message}`;
        await ctx.reply("✅ Xabaringiz adminga yuborildi. Tez orada siz bilan bog'lanishadi.", Markup.inlineKeyboard([
            [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
        ]));
        await ctx.telegram.sendMessage(OWNER, adminMessage);
        return;
    } catch (err) {
        await errorConsole(err, "Adminga xabar jo'natishda xatolik mavjud:", ctx);
    }
}