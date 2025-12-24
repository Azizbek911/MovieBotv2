import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole"
import { isAdmin } from "../isAdmin";
import { Message } from "telegraf/types";
import { getJanrButtons } from "../buttons/buttons";
import { updateLastMessage } from "../updateLastMessage";


export const addMovies = async (ctx: Context, newMessage: Message) => {
    try {
        if (!ctx.message || !ctx.message.text || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const checkAdmin = await isAdmin(ctx.from.id);
        const message = ctx.message.text;
        if (!ctx.session.movie_name && checkAdmin) {
            ctx.session.movie_name = message;
            newMessage = await ctx.reply(`${message} qabul qildindi ✅\n\n🎭 Nechta qism kiritmoqchisiz ${message} uchun: `);
        } else if (!ctx.session.movie_parts && checkAdmin) {
            const count = parseInt(message);
            if (isNaN(count) || count === 0) {
                newMessage = await ctx.reply("⚠️ Iltimos, menga raqamli malumot jo'nating va u son 0 teng bo'lmasin", Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]));
            } else {
                if (count > 10) {
                    newMessage = await ctx.reply("❗️ Kechirasiz, birinchi yaratishda eng ko'pi bilan 10 video tavsiya qilinadi:\n\n⚠️ Keyinchalik taxrirlash bo'limi orqali hohlagancha qism qo'shsangiz bo'ladi", Markup.inlineKeyboard([
                        [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                    ]));
                } else {
                    const buttons = await getJanrButtons()
                    buttons.push([
                        Markup.button.callback("🏠 Bosh Menu", "admin_main")
                    ]);
                    ctx.session.movie_parts = count;
                    newMessage = await ctx.reply(`✅ Qismlar qabul qilindi\n\n🔢 Siz kiritgan qismlar: ${count}\n\n🎥 Endi kino janrini tanleng:`, Markup.inlineKeyboard(buttons));
                }
            }
        }

        if (newMessage) await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        errorConsole(err, "Kino qo'shishda xatolik mavjud", ctx)
    }
}