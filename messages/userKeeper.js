import { userKeeperRequest } from "../functions/ChatJoinRequest/userKeeper.js"
import { errorConsole } from "../functions/errorConsole.js"



export const userKeeper = async (ctx) => {
    try {
        await userKeeperRequest(ctx);
    } catch (err) {
        errorConsole(err, "User saqlashda xatolik mavjud, zayafka uchun:", ctx)
    }
}