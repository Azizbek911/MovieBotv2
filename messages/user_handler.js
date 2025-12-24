import { OWNER } from "../config/env.js";
import User from "../models/user.module.js";



export const user_handler = async (ctx) => {
    try {
        const userID = ctx.from.id;
        const first_name = ctx.from.first_name || "";
        const last_name = ctx.from.last_name || "";
        const username = ctx.from.username || "";
        let role = userID == OWNER ? "owner" : "user";

        let user = await User.findOne({ id: userID });
        if (!ctx.session) ctx.session = {};
        if (!user) {
            user = new User({
                id: userID,
                first_name,
                last_name,
                username,
                role
            });
            await user.save();
        }

    } catch (error) {
        console.log(error);
        ctx.reply("Xatolik mavjud iltimos keyinroq urinib ko'ring!");
    }
}
