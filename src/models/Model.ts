import Database from "../Database.ts";

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

    public toSafeObject(obj: T): Partial<T> {
        return obj;
    }
}

export default Model;