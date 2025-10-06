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
        return this.userModel.create({...data, password});
    }

    public async login(email: string, password: string) {
        const user = await this.userModel.findOne({email});
        if(!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            throw new HttpError(400, "Неверный пароль");
        }

        return user;
    }

    public async getUserById(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);

        const user = await this.userModel.findOne({id: targetId});
        if(!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        return user;
    }

    public async getUsers(isAdmin: boolean, page: number) {
        const USERS_PER_PAGE = 30;
        if(!isAdmin) {
            throw new HttpError(403, "У вас нет доступа к списку пользователей");
        }

        return this.userModel.getUsers(page * USERS_PER_PAGE, USERS_PER_PAGE);
    }

    public async blockUser(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);
        return this.userModel.blockUser(targetId);
    }

    private checkUserAccess(currentUser: User, targetId: number) {
        if(currentUser.id !== targetId && currentUser.role !== Role.ADMIN) {
            throw new HttpError(403, "У вас нет доступа к этому пользователю");
        }
    }
}

export default UserService;