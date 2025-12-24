import botSetting from "../models/settings.module.js";


export const setTheSetting = async () => {
    try {
        const isSet = await botSetting.findOne({ name: "setting" });

        if (!isSet) {
            const result = await botSetting.create({ name: "setting" });
            console.log("Bot settings is set successfully!");
        } else {
            console.log("Bot settings was seted!");
        }
    } catch (err) {
        console.log(err);
    }
}