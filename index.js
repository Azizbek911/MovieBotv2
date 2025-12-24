import { TOKEN } from "./config/env.js";

import { Markup, Telegraf, session } from "telegraf";
import connectToDatabase from "./database/mongodb.js";
import { user_handler } from "./messages/user_handler.js";
import { startMessage } from "./messages/start.js";
import { callbackQueryHandler } from "./messages/callbackQuery.js";
import { messageDirector } from "./messages/messageDirector.js";
import { setTheSetting } from "./functions/setTheSetting.ts";
import { checkLastID } from "./functions/checkLastID.ts";
import { buttonsArray, getJanrButtons } from "./functions/buttons/buttons.ts";
import {onVideo} from "./messages/onVideo.js";
import { onText } from "./messages/onText.js";
import { userKeeper } from "./messages/userKeeper.js";
import { forceSubscriptionChecker } from "./functions/messageDirector/forceSubscriptionChecker.ts";
import { forceSubscriptions } from "./functions/forceSubscription.ts";
import User from "./models/user.module.js";


const bot = new Telegraf(TOKEN);
bot.use(session());
connectToDatabase();
setTheSetting();
checkLastID();

bot.on("message", async (ctx, next) => {
    const channels = await forceSubscriptions(ctx);
    const targetUser = await User.findOne({ id: ctx.from.id });
    await user_handler(ctx, next);
    if (channels.length !== 0 && targetUser.role === "user") {
        await forceSubscriptionChecker(ctx, next);
    } else {
        next();
    }
});

bot.start(async (ctx) => {
    await startMessage(ctx);
});

bot.command("test", async (ctx) => {
    const buttons = await getJanrButtons()
    await ctx.reply("Tugmalar olindi!", Markup.inlineKeyboard(buttons))
    console.warn(buttons);
    console.warn(await buttonsArray())
});
bot.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query; // foydalanuvchi yozgan matn


    const results = [
        {
            type: "article",
            id: "1",
            title: ctx.botInfo.first_name,
            description: "⚠️ Kechirasiz bu funksiyalar vaqtinchalik ishlamayabdi",
            input_message_content: {
                message_text: `/start`
            }
        }
    ];

    await ctx.answerInlineQuery(results, {
        cache_time: 0
    });
});
bot.on("chat_join_request", async (ctx) => await userKeeper(ctx))


bot.on("callback_query", async (ctx) => {
    callbackQueryHandler(ctx);
});



bot.on("video", async (ctx) => await onVideo(ctx));
bot.on("text", async (ctx, next) => await onText(ctx, next));
bot.on("message", async (ctx) => {
    messageDirector(ctx);
})

bot.launch((err) => {
    if (err) throw new Error(err);
    else console.log("Bot started successfully.");
});

export default bot;