import bot from "../index.js"

export const isBotAdmin = async (chatID: string, botID: number): Promise<Boolean> => {
    try {
        const member = await bot.telegram.getChatMember(chatID, botID);
        if (member.status === "administrator") {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}