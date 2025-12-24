import { userKeeperRequest } from "../functions/ChatJoinRequest/userKeeper"
import { errorConsole } from "../functions/errorConsole"



export const userKeeper = async (ctx) => {
    try {
        await userKeeperRequest(ctx);
    } catch (err) {
        errorConsole(err, "User saqlashda xatolik mavjud, zayafka uchun:", ctx)
    }
}