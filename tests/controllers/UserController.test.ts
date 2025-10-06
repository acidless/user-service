import express from "express";

jest.mock("../../src/services/UserService.ts", () => {
    return {
        __esModule: true,
        default: class {
            register = jest.fn();
            login = jest.fn();
            getUserById = jest.fn();
            getUsers = jest.fn();
            blockUser = jest.fn();
            changeRole = jest.fn();
        }
    };
});

import UserController from "../../src/controllers/UserController.ts";
import { jwtSign } from "../../src/JWT.ts";

jest.mock("../../src/JWT.ts", () => ({ jwtSign: jest.fn() }));

describe("UserController", () => {
    let req: Partial<express.Request>;
    let res: Partial<express.Response>;
    let mockUserService: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUserService = (UserController as any).userService;

        res = {
            cookie: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe("register", () => {
        it("should register a user and return token", async () => {
            const user = { id: 1, email: "test@test.com" };
            (mockUserService.register as jest.Mock).mockResolvedValue(user);
            (jwtSign as jest.Mock).mockReturnValue("mockToken");

            req = {
                body: { email: "test@test.com", fullname: "John Doe", password: "123" },
            };

            await UserController.register(req as express.Request, res as express.Response);

            expect(mockUserService.register).toHaveBeenCalledWith({
                email: "test@test.com",
                fullname: "John Doe",
                password: "123",
            });
            expect(jwtSign).toHaveBeenCalledWith({ id: 1 });
            expect(res.cookie).toHaveBeenCalledWith("token", "mockToken", {
                httpOnly: true,
                secure: true,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, user });
        });
    });

    describe("login", () => {
        it("should login a user and return token", async () => {
            const user = { id: 2, email: "test2@test.com" };
            (mockUserService.login as jest.Mock).mockResolvedValue(user);
            (jwtSign as jest.Mock).mockReturnValue("mockToken");

            req = { body: { email: "test2@test.com", password: "pass" } };

            await UserController.login(req as express.Request, res as express.Response);

            expect(mockUserService.login).toHaveBeenCalledWith("test2@test.com", "pass");
            expect(jwtSign).toHaveBeenCalledWith({ id: 2 });
            expect(res.cookie).toHaveBeenCalledWith("token", "mockToken", {
                httpOnly: true,
                secure: true,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, user });
        });
    });

    describe("getUserById", () => {
        it('should return user for "me"', async () => {
            const user = { id: 1, email: "test@test.com" };
            (mockUserService.getUserById as jest.Mock).mockResolvedValue(user);

            req = { params: { id: "me" }, user: { id: 1 } } as any;

            await UserController.getUserById(req as express.Request, res as express.Response);

            expect(mockUserService.getUserById).toHaveBeenCalledWith({ id: 1 }, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, user });
        });

        it("should return user for numeric id", async () => {
            const user = { id: 3, email: "john@test.com" };
            (mockUserService.getUserById as jest.Mock).mockResolvedValue(user);

            req = { params: { id: "3" }, user: { id: 10 } } as any;

            await UserController.getUserById(req as express.Request, res as express.Response);

            expect(mockUserService.getUserById).toHaveBeenCalledWith({ id: 10 }, 3);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, user });
        });
    });

    describe("getUsers", () => {
        it("should fetch users with default page=0", async () => {
            const users = [{ id: 1 }, { id: 2 }];
            (mockUserService.getUsers as jest.Mock).mockResolvedValue(users);

            req = { query: {}, user: { id: 1 } } as any;

            await UserController.getUsers(req as express.Request, res as express.Response);

            expect(mockUserService.getUsers).toHaveBeenCalledWith({ id: 1 }, 0);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, users });
        });

        it("should convert query.page to number", async () => {
            const users = [{ id: 5 }];
            (mockUserService.getUsers as jest.Mock).mockResolvedValue(users);

            req = { query: { page: "3" }, user: { id: 99 } } as any;

            await UserController.getUsers(req as express.Request, res as express.Response);

            expect(mockUserService.getUsers).toHaveBeenCalledWith({ id: 99 }, 3);
            expect(res.json).toHaveBeenCalledWith({ success: true, users });
        });
    });

    describe("blockUser", () => {
        it("should call userService.blockUser", async () => {
            (mockUserService.blockUser as jest.Mock).mockResolvedValue(undefined);
            req = { params: { id: "7" }, user: { id: 99 } } as any;

            await UserController.blockUser(req as express.Request, res as express.Response);

            expect(mockUserService.blockUser).toHaveBeenCalledWith({ id: 99 }, 7);
        });
    });

    describe("changeUserRole", () => {
        it("should call userService.changeRole and return updated user", async () => {
            const updated = { id: 5, role: "ADMIN" };
            (mockUserService.changeRole as jest.Mock).mockResolvedValue(updated);

            req = {
                params: { id: "5" },
                user: { id: 99 },
                body: { role: "ADMIN" },
            } as any;

            await UserController.changeUserRole(req as express.Request, res as express.Response);

            expect(mockUserService.changeRole).toHaveBeenCalledWith({ id: 99 }, 5, "ADMIN");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, user: updated });
        });
    });
});