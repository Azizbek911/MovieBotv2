import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole"
import fee from "../../models/fee.module";
import { updateLastMessage } from "../updateLastMessage";
import { clearSession } from "../clearSession";


export const setFee = async (ctx: Context) => {
    try {
        let newMessage;
        if (!ctx.message || !ctx.message.text) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const message = parseInt(ctx.message.text);
        if (isNaN(message)) return ctx.reply("😨 Siz menga raqamlardan tashkil topgan xabar yuborishingiz kear:");
        const feeCost = await fee.findOne({ name: "fee" });
        if (!feeCost) {
            await fee.create({ name: "fee", fee: message });
            newMessage = await ctx.reply(`✅ 1 oylik obuna uchun narx kiritildi\n\n💰 Siz kiritgan narx: ${message} UZS`, Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else {
            feeCost.fee = message;
            await feeCost.save();
            newMessage = await ctx.reply(`✅ 1 oylik obuna uchun narx yangilandi\n\n💰 Siz kiritgan narx: ${message} UZS`, Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }
        clearSession(ctx);
        if (newMessage) await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Narxni joylashda xatolik mavjud:", ctx);
    }
}