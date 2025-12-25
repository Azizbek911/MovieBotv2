import last_id from "../models/counter.module.js";




export const checkLastID = async () => {
    try {
        const checkID = await last_id.findOne({ name: "counter" });
        if (!checkID) {
            last_id.create({ name: "counter" });
            console.warn("Counter was created");
        } else {
            console.warn("There was last id already")
        }
    } catch (err) {
        console.warn("ID qadashda xatolik mavjud:")
        console.error(err);
    }
}


export const updateLastID = async () => {
    try {
        let lastID = await last_id.findOne({ name: "counter" });
        
        if (!lastID) {
            await last_id.create({ name: "counter", lastID: 0 });
            console.warn("Counter was created");
        } else {
            lastID.lastID = (lastID.lastID || 0) + 1;
            await lastID.save();
        }
    } catch (err) {
        console.warn("Ohirgi IDni yangilashda xatolik mavjud:");
        console.error(err);
    }
}

