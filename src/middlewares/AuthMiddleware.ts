import express from "express";
import {jwtVerify} from "../JWT";
import UserModel from "../models/UserModel";
import HttpError from "../HttpError";

class AuthMiddleware {
    private userModel: UserModel;

    public constructor() {
        this.userModel = new UserModel();
    }

    public async execute(req: express.Request, res: express.Response, next: express.NextFunction) {
        const token = req.cookies.token;
        const userId = jwtVerify(token);

        const user = await this.userModel.findOne({id: Number(userId)});
        if (!user) {
            throw new HttpError(403, "Неверный токен");
        }

        (req as any).user = user;
        next();
    }
}

export default new AuthMiddleware();