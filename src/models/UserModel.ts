import Model from "./Model";
import {Status, User} from "../generated/prisma/client";

class UserModel extends Model {
    public create(data: User) {
        return this.db.prisma().user.create({
            data
        });
    }

    public getById(id: number) {
        return this.db.prisma().user.findUnique({
            where: {
                id
            }
        });
    }

    public getUsers(offset: number, limit: number) {
        return this.db.prisma().user.findMany({
            skip: offset,
            take: limit
        });
    }

    public blockUser(id: number) {
        return this.db.prisma().user.update({
            where: {
                id
            },
            data: {
                status: Status.BLOCKED
            }
        });
    }
}

export default UserModel;