import {PrismaClient} from "./generated/prisma/client.ts";

class Database {
    private static instance_: Database;
    private prisma_: PrismaClient;

    private constructor() {
        this.prisma_ = new PrismaClient();
    }

    public static instance(): Database {
        if (!Database.instance_) {
            Database.instance_ = new Database();
        }
        return Database.instance_;
    }

    public prisma() {
        return this.prisma_;
    }
}

export default Database;