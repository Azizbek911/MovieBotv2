import { Context, Markup } from "telegraf";
import User from "../models/user.module.js";
import { isAdmin } from "./isAdmin.ts";
import { admin, UserMainButton } from "./buttons/userButtons.js";

export const errorConsole = async (err: any, message: string, ctx: Context) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const targetUser = await User.findOne({ id: ctx.from.id });
        if (!targetUser) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const checkAdmin = await isAdmin(targetUser.id);
        console.warn(message);
        console.error(err);
        ctx.reply("⚠️ Xatolik yuz berdi\n\n😓 Iltimos keyinroq urinib ko'ring", Markup.inlineKeyboard(checkAdmin ? admin : UserMainButton))
    } catch (err) {
        console.error(err)
    }
}