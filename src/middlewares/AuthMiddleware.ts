import express from "express";
import {jwtVerify} from "../JWT.ts";
import UserModel from "../models/UserModel.ts";
import HttpError from "../HttpError.ts";
import {Status} from "../generated/prisma/enums.ts";

class AuthMiddleware {
    private userModel: UserModel;

    public constructor() {
        this.userModel = new UserModel();
    }

    public execute = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const token = req.cookies.token;
        const obj: any = jwtVerify(token);
        if (!obj || !obj.id) {
            throw new HttpError(403, "Вы не авторизованы");
        }

        const user = await this.userModel.findOne({id: obj.id});
        if (!user) {
            throw new HttpError(403, "Неверный токен");
        }

        if(user.status === Status.BLOCKED) {
            throw new HttpError(403, "Ваш аккаунт заблокирован");
        }

        (req as any).user = user;
        next();
    }
}

export default new AuthMiddleware();