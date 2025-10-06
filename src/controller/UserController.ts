import express from "express";
import UserService from "../services/UserService";
import {Role} from "../generated/prisma/enums";

class UserController {
    private userService: UserService;

    public constructor() {
        this.userService = new UserService();
    }

    public async register(req: express.Request, res: express.Response) {
        const user = await this.userService.register(req.body);

        return res.status(201).json({
            success: true,
            user
        });
    }

    public async login(req: express.Request, res: express.Response) {
        const {email, password} = req.body;
        const user = await this.userService.login(email, password);

        return res.status(200).json({
            success: true,
            user
        });
    }

    public async getUserById(req: express.Request, res: express.Response) {
        const {id} = req.params;
        const user = await this.userService.getUserById((req as any).user, Number(id));

        return res.status(200).json({
            success: true,
            user
        });
    }

    public async getUsers(req: express.Request, res: express.Response) {
        const {page} = req.query;

        const isAdmin = (req as any).user.role === Role.ADMIN;
        const users = await this.userService.getUsers(isAdmin, page ? Number(page) : 0);

        return res.status(200).json({
            success: true,
            users
        });
    }

    public async blockUser(req: express.Request, res: express.Response) {
        const {id} = req.params;
        const user = await this.userService.blockUser((req as any).user, Number(id));

        return res.status(200).json({
            success: true,
            user
        });
    }
}

export default UserController;