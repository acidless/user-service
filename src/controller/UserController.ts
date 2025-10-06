import express from "express";
import UserService from "../services/UserService.js";
import {Role} from "../generated/prisma/enums.js";
import {jwtSign} from "../JWT.js";

class UserController {
    private userService: UserService;

    public constructor() {
        this.userService = new UserService();
    }

    public register = async (req: express.Request, res: express.Response) => {
        const user = await this.userService.register(req.body);
        const token = jwtSign({id: user.id});

        return res.cookie("token", token, {httpOnly: true, secure: true}).status(201).json({
            success: true,
            user
        });
    }

    public login = async (req: express.Request, res: express.Response) => {
        const {email, password} = req.body;
        const user = await this.userService.login(email, password);
        const token = jwtSign({id: user.id});

        return res.cookie("token", token, {httpOnly: true, secure: true}).status(200).json({
            success: true,
            user
        });
    }

    public getUserById = async  (req: express.Request, res: express.Response) => {
        const {id} = req.params;

        let numId = Number(id);
        if (id === "me") {
            numId = (req as any).user.id;
        }

        const user = await this.userService.getUserById((req as any).user, numId);

        return res.status(200).json({
            success: true,
            user
        });
    }

    public getUsers = async (req: express.Request, res: express.Response) => {
        const {page} = req.query;

        const isAdmin = (req as any).user.role === Role.ADMIN;
        const users = await this.userService.getUsers(isAdmin, page ? Number(page) : 0);

        return res.status(200).json({
            success: true,
            users
        });
    }

    public blockUser = async (req: express.Request, res: express.Response) => {
        const {id} = req.params;
        const user = await this.userService.blockUser((req as any).user, Number(id));

        return res.status(200).json({
            success: true,
            user
        });
    }
}

export default new UserController();