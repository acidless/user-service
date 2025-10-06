import Database from "../Database";

abstract class Model {
    protected db: Database;

    public constructor() {
        this.db = Database.instance();
    }
}

export default Model;