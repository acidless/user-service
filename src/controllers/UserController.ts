import express from "express";
import UserService from "../services/UserService.ts";
import {jwtSign} from "../JWT.ts";

class UserController {
    private userService: UserService;

    public constructor() {
        this.userService = new UserService();
    }

    public register = async (req: express.Request, res: express.Response) => {
        const {email, fullname, password} = req.body;

        const user = await this.userService.register({email, fullname, password});
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

    public getUserById = async (req: express.Request, res: express.Response) => {
        const user = await this.userService.getUserById(req.user, this.parseUserId(req));

        return res.status(200).json({
            success: true,
            user
        });
    }

    public getUsers = async (req: express.Request, res: express.Response) => {
        const {page} = req.query;

        const users = await this.userService.getUsers(req.user, page ? Number(page) : 0);

        return res.status(200).json({
            success: true,
            users
        });
    }

    public blockUser = async (req: express.Request, res: express.Response) => {
        await this.userService.blockUser(req.user, this.parseUserId(req));
        return res.status(204);
    }

    public changeUserRole = async (req: express.Request, res: express.Response) => {
        const {role} = req.body;

        const user = await this.userService.changeRole(req.user, this.parseUserId(req), role);
        return res.status(200).json({
            success: true,
            user
        });
    }

    private parseUserId(req: express.Request) {
        const {id} = req.params;
        if (id === "me" && req.user) {
            return req.user.id;
        }

        return Number(id);
    }
}

export default new UserController();