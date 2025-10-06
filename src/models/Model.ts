import Database from "../Database.js";

abstract class Model<T> {
    protected db: Database;

    public constructor() {
        this.db = Database.instance();
    }

    public validate(obj: Partial<T>, keys: (keyof T)[]) {
        for (const key of keys) {
            if (!obj[key]) {
                throw new Error(`Property ${String(key)} is required`);
            }
        }
    }
}

export default Model;