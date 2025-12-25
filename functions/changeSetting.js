import botSetting from "../models/settings.module.js";


export const changeSetting = async (type, isFee) => {
    try {
        const allowedFields = [
            'book_movie',
            'random_movie', 
            'janr_movie',
            'country_movie',
            'year_movie',
            'language_movie'
        ];

        if (!allowedFields.includes(type)) {
            console.error(`Noto'g'ri sozlanma turi: ${type}`);
            return false;
        }

        const update = { [type]: isFee };

        const result = await botSetting.findOneAndUpdate(
            { name: "setting" },
            update,
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log('Sozlanma yangilandi:', result);
        return true;
    } catch (err) {
        console.error('Sozlanmani yangilashda xato:', err);
        return false;
    }
}