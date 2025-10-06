import Model from "./Model.js";
import {Status, User} from "../generated/prisma/client.js";
import {UserWhereUniqueInput} from "../generated/prisma/models/User.js";

class UserModel extends Model<User> {
    public create(data: User) {
        this.validate(data, ["fullname", "password", "email"]);

        return this.db.prisma().user.create({
            data
        });
    }

    public findOne(filter: UserWhereUniqueInput) {
        return this.db.prisma().user.findUnique({
            where: {
                ...filter
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