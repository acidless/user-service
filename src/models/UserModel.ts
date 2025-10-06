import Model from "./Model.js";
import {Role, User} from "../generated/prisma/client.js";
import {UserWhereUniqueInput} from "../generated/prisma/models/User.js";

export type UserRegisterDTO = {
    fullname: string;
    email: string;
    password: string;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

class UserModel extends Model<User> {
    public create(data: UserRegisterDTO) {
        this.validate(data, ["fullname", "password", "email"]);

        return this.db.prisma().user.create({
            data: {
                ...data,
                role: data.email === ADMIN_EMAIL ? Role.ADMIN : Role.USER
            }
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

    public update(id: number, user: Partial<User>) {
        return this.db.prisma().user.update({
            where: {
                id
            },
            data: user
        });
    }
}

export default UserModel;