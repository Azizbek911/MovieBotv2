import { OWNER } from "../config/env.js";
import User from "../models/user.module.js";
import { isAdmin } from "../functions/isAdmin.js";
import { messageToAdmin } from "../functions/messageDirector/MessageToAdmin.js";
import { addAdmin } from "../functions/messageDirector/addAdmin.js";
import { removeAdmin } from "../functions/messageDirector/removeAdmin.js";
import { addYear } from "../functions/messageDirector/addYear.js";
import { removeYear } from "../functions/messageDirector/removeYear.js";
import { addJanr } from "../functions/messageDirector/addJanr.js";
import { removeJanr } from "../functions/messageDirector/removeJanr.js";
import { addCountry } from "../functions/messageDirector/addCountry.js";
import { removeCountry } from "../functions/messageDirector/removeCountry.js";
import { addLanguage } from "../functions/messageDirector/addLanguage.js";
import { removeLanguage } from "../functions/messageDirector/removeLanguage.js";
import { addMainChannel } from "../functions/messageDirector/addMainChannel.js";
import { addMovies } from "../functions/messageDirector/addMovie.js";
import { setFee } from "../functions/messageDirector/setFee.js";
import { activateSubscribe } from "../functions/messageDirector/activateSubscribe.js";
import { addForceSubscription } from "../functions/messageDirector/addForceSubscription.js";
import { removeForceSubscription } from "../functions/messageDirector/removeForceSubscription.js";
import { addZayafka } from "../functions/messageDirector/addZayafka.js";
import { removeZayafka } from "../functions/messageDirector/removeZayafka.js";
import { addExtraLink } from "../functions/messageDirector/addExtraLink.js";
import { removeExtraLink } from "../functions/messageDirector/removeExtraLink.js";
import { messageSender } from "../functions/messageDirector/messageSender.js";


export const messageDirector = async (ctx) => {
    try {
        const userID = ctx.from.id;
        const targetUser = await User.findOne({ id: userID });
        const message = ctx.message.text;
        const checkAdmin = await isAdmin(userID);
        let newMessage;

        if (ctx.session.operation === "message_to_admin") {
            await messageToAdmin(ctx, OWNER, message);
        } else if (ctx.session.operation === "add_admin") {
            await addAdmin(ctx, message, newMessage);
        } else if (ctx.session.operation === "remove_admin") {
            await removeAdmin(ctx, message, newMessage);
        } else if (ctx.session.operation === "add_year" && checkAdmin) {
            await addYear(message, newMessage, ctx)
        } else if (ctx.session.operation === "remove_year" && checkAdmin) {
            await removeYear(ctx, message, newMessage);
        } else if (ctx.session.operation === "add_janr" && checkAdmin) {
            await addJanr(ctx, message, newMessage);
        } else if (ctx.session.operation === "remove_janr" && checkAdmin) {
            await removeJanr(ctx, message, newMessage);
        } else if (ctx.session.operation === "add_country" && checkAdmin) {
            await addCountry(ctx, message, newMessage);
        } else if (ctx.session.operation === "remove_country" && checkAdmin) {
            await removeCountry(ctx, message, newMessage)
        } else if (ctx.session.operation === "add_language" && checkAdmin) {
            await addLanguage(ctx, message, newMessage);
        } else if (ctx.session.operation === "remove_language" && checkAdmin) {
            await removeLanguage(ctx, message, newMessage);
        } else if (ctx.session.operation === "add_main_channel" && targetUser.role === "owner") {
            await addMainChannel(ctx, message, newMessage);
        } else if (ctx.session.operation === "add_movie" && checkAdmin) {
            await addMovies(ctx, newMessage)
        } else if (ctx.session.operation === "setFee" && checkAdmin) {
            await setFee(ctx);
        } else if (ctx.session.operation === "vip_user_activation" && checkAdmin) {
            await activateSubscribe(ctx);
        } else if (ctx.session.operation === "add_force_subscription" && checkAdmin) {
            await addForceSubscription(ctx);
        } else if (ctx.session.operation === "remove_force_subscription" && checkAdmin) {
            await removeForceSubscription(ctx);
        } else if (ctx.session.operation === "add_zayafka" && checkAdmin) {
            await addZayafka(ctx);
        } else if (ctx.session.operation === "remove_zayafka" && checkAdmin) {
            await removeZayafka(ctx);
        } else if (ctx.session.operation === "add_extralink" && checkAdmin) {
            await addExtraLink(ctx);
        } else if (ctx.session.operation === "remove_extralink" && checkAdmin) {
            await removeExtraLink(ctx);
        } else if (ctx.session.operation === "message_sender" && checkAdmin) {
            await messageSender(ctx)
        }

        else {
            ctx.reply("Kechirasiz, bu buyruqni taney olmadim\n\nBalki bot yangilangan bo'lishi mumkin\n\n/start")
        }

    } catch (error) {
        console.error("Error in messageDirector:", error);
        ctx.reply("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
}