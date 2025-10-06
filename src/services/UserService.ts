import bcrypt from "bcrypt";
import UserModel from "../models/UserModel";
import {Role, Status, User} from "../generated/prisma/client";
import HttpError from "../HttpError";

class UserService {
    private userModel: UserModel;

    public constructor() {
        this.userModel = new UserModel();
    }

    public async register(data: User) {
        const user = await this.userModel.findOne({email: data.email});
        if (user) {
            throw new HttpError(400, "Пользователь с такой почтой уже существует");
        }

        const password = await bcrypt.hash(data.password, 10);
        const newUser = await this.userModel.create({...data, password});
        return {...newUser, password: undefined};
    }

    public async login(email: string, password: string) {
        const user = await this.userModel.findOne({email});
        if (!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new HttpError(400, "Неверный пароль");
        }

        return {...user, password: undefined};
    }

    public async getUserById(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);

        const user = await this.userModel.findOne({id: targetId});
        if (!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        return {...user, password: undefined};
    }

    public async getUsers(isAdmin: boolean, page: number) {
        const USERS_PER_PAGE = 30;
        if (!isAdmin) {
            throw new HttpError(403, "У вас нет доступа к списку пользователей");
        }

        const users = await this.userModel.getUsers(page * USERS_PER_PAGE, USERS_PER_PAGE);
        return users.map(user => ({...user, password: undefined}));
    }

    public async blockUser(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);

        const user = await this.userModel.blockUser(targetId);
        return {...user, password: undefined};
    }

    private checkUserAccess(currentUser: User, targetId: number) {
        if (currentUser.id !== targetId && currentUser.role !== Role.ADMIN) {
            throw new HttpError(403, "У вас нет доступа к этому пользователю");
        }
    }
}

export default UserService;