import bcrypt from "bcrypt";
import UserModel, {UserRegisterDTO} from "../models/UserModel.ts";
import {Role, Status, User} from "../generated/prisma/client.ts";
import HttpError from "../HttpError.ts";

class UserService {
    private userModel: UserModel;

    public constructor() {
        this.userModel = new UserModel();
    }

    public async register(data: UserRegisterDTO) {
        const user = await this.userModel.findOne({email: data.email});
        if (user) {
            throw new HttpError(400, "Пользователь с такой почтой уже существует");
        }

        const password = await bcrypt.hash(data.password, 10);
        const newUser = await this.userModel.create({...data, password});
        return this.userModel.toSafeObject(newUser);
    }

    public async login(email: string, password: string) {
        const user = await this.userModel.findOne({email});
        if (!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        if (user.status === Status.BLOCKED) {
            throw new HttpError(403, "Пользователь заблокирован");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new HttpError(400, "Неверный пароль");
        }

        return this.userModel.toSafeObject(user);
    }

    public async getUserById(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);

        const user = await this.userModel.findOne({id: targetId});
        if (!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        return this.userModel.toSafeObject(user);
    }

    public async getUsers(currentUser: User, page: number) {
        const USERS_PER_PAGE = 30;
        this.checkUserAdmin(currentUser);


        const users = await this.userModel.getUsers(page * USERS_PER_PAGE, USERS_PER_PAGE);
        return users.map((user: User) => this.userModel.toSafeObject(user));
    }

    public async blockUser(currentUser: User, targetId: number) {
        this.checkUserAccess(currentUser, targetId);

        await this.userModel.update(targetId, {status: Status.BLOCKED});
    }

    public async changeRole(currentUser: User, targetId: number, role: Role) {
        this.checkUserAdmin(currentUser);

        if(!Object.keys(Role).includes(role)) {
            throw new HttpError(400, "Указана несуществующая роль");
        }

        const user = await this.userModel.update(targetId, {role});
        if (!user) {
            throw new HttpError(404, "Пользователь не найден");
        }

        return this.userModel.toSafeObject(user);
    }

    private checkUserAccess(currentUser: User, targetId: number) {
        if (currentUser.id !== targetId && currentUser.role !== Role.ADMIN) {
            throw new HttpError(403, "У вас нет доступа к этому пользователю");
        }
    }

    private checkUserAdmin(currentUser: User) {
        if (currentUser.role !== Role.ADMIN) {
            throw new HttpError(403, "У вас нет доступа к этому действию");
        }
    }
}

export default UserService;