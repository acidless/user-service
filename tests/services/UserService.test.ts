import bcrypt from "bcrypt";
import UserService from "../../src/services/UserService.ts";
import UserModel from "../../src/models/UserModel.ts";
import HttpError from "../../src/HttpError.ts";
import { Role, Status } from "../../src/generated/prisma/client.ts";

jest.mock("../../src/generated/prisma/client.ts", () => ({
    Role: {ADMIN: "ADMIN", USER: "USER"},
    Status: {ACTIVE: "ACTIVE", BLOCKED: "BLOCKED"},
}));

jest.mock("../../src/models/UserModel.ts");
jest.mock("bcrypt");

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockGetUsers = jest.fn();
const mockUpdate = jest.fn();

(UserModel as jest.Mock).mockImplementation(() => ({
    findOne: mockFindOne,
    create: mockCreate,
    getUsers: mockGetUsers,
    update: mockUpdate,
    toSafeObject: jest.fn((obj) => ({
        ...obj,
        password: undefined,
    }))
}));

describe("UserService", () => {
    let service: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UserService();
    });

    describe("register", () => {
        it("should register a new user", async () => {
            const dto = { fullname: "Alice", email: "alice@example.com", password: "123" };
            const hashed = "hashed123";
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
            mockFindOne.mockResolvedValue(null);
            const createdUser = { id: 1, ...dto, password: hashed, role: Role.USER };
            mockCreate.mockResolvedValue(createdUser);

            const result = await service.register(dto);

            expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
            expect(mockCreate).toHaveBeenCalledWith({ ...dto, password: hashed });
            expect(result).toEqual({ ...createdUser, password: undefined });
        });

        it("should throw if user already exists", async () => {
            mockFindOne.mockResolvedValue({ id: 1 });
            const dto = { fullname: "Alice", email: "alice@example.com", password: "123" };

            await expect(service.register(dto)).rejects.toThrow(HttpError);
            await expect(service.register(dto)).rejects.toThrow("Пользователь с такой почтой уже существует");
        });
    });

    describe("login", () => {
        it("should login user with correct password", async () => {
            const user = { id: 1, email: "a@a.com", password: "hashed", status: Status.ACTIVE };
            mockFindOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login("a@a.com", "123");

            expect(mockFindOne).toHaveBeenCalledWith({ email: "a@a.com" });
            expect(result).toEqual({ ...user, password: undefined });
        });

        it("should throw if user not found", async () => {
            mockFindOne.mockResolvedValue(null);
            await expect(service.login("a@a.com", "123")).rejects.toThrow(HttpError);
        });

        it("should throw if user is blocked", async () => {
            mockFindOne.mockResolvedValue({
                id: 1,
                password: "hash",
                status: Status.BLOCKED
            });
            await expect(service.login("a@a.com", "123")).rejects.toThrow("Пользователь заблокирован");
        });

        it("should throw if password is incorrect", async () => {
            mockFindOne.mockResolvedValue({
                id: 1,
                password: "hash",
                status: Status.ACTIVE
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.login("a@a.com", "wrong")).rejects.toThrow("Неверный пароль");
        });
    });

    describe("getUserById", () => {
        const admin: any = { id: 1, role: Role.ADMIN, status: Status.ACTIVE };
        const user = { id: 2, role: Role.USER, status: Status.ACTIVE, password: "hash" };

        it("should return user for admin", async () => {
            mockFindOne.mockResolvedValue(user);
            const result = await service.getUserById(admin, 2);
            expect(mockFindOne).toHaveBeenCalledWith({ id: 2 });
            expect(result).toEqual({ ...user, password: undefined });
        });

        it("should throw if user not found", async () => {
            mockFindOne.mockResolvedValue(null);
            await expect(service.getUserById(admin, 3)).rejects.toThrow("Пользователь не найден");
        });

        it("should deny access for another regular user", async () => {
            const currentUser = { id: 2, role: Role.USER };
            await expect(service.getUserById(currentUser as any, 3)).rejects.toThrow("У вас нет доступа к этому пользователю");
        });
    });

    describe("getUsers", () => {
        const admin = { id: 1, role: Role.ADMIN };
        const users = [
            { id: 1, password: "hash1" },
            { id: 2, password: "hash2" }
        ];

        it("should return users for admin", async () => {
            mockGetUsers.mockResolvedValue(users);
            const result = await service.getUsers(admin as any, 0);
            expect(mockGetUsers).toHaveBeenCalledWith(0, 30);
            expect(result).toEqual([
                { id: 1, password: undefined },
                { id: 2, password: undefined }
            ]);
        });

        it("should deny access for regular user", async () => {
            const user = { id: 2, role: Role.USER };

            await expect(service.getUsers(user as any, 0)).rejects.toThrow(HttpError);
            await expect(service.getUsers(user as any, 0)).rejects.toThrow("У вас нет доступа к этому действию");
        });
    });

    describe("blockUser", () => {
        const admin = { id: 1, role: Role.ADMIN };

        it("should block user when allowed", async () => {
            await service.blockUser(admin as any, 2);
            expect(mockUpdate).toHaveBeenCalledWith(2, { status: Status.BLOCKED });
        });

        it("should deny blocking if not allowed", async () => {
            const currentUser = { id: 2, role: Role.USER };
            await expect(service.blockUser(currentUser as any, 3)).rejects.toThrow("У вас нет доступа к этому пользователю");
        });
    });

    describe("changeRole", () => {
        const admin = { id: 1, role: Role.ADMIN };

        it("should change role successfully", async () => {
            const updated = { id: 2, role: Role.USER, password: "hash" };
            mockUpdate.mockResolvedValue(updated);
            const result = await service.changeRole(admin as any, 2, Role.USER);

            expect(mockUpdate).toHaveBeenCalledWith(2, { role: Role.USER });
            expect(result).toEqual({ ...updated, password: undefined });
        });

        it("should throw if invalid role", async () => {
            await expect(
                service.changeRole(admin as any, 2, "INVALID_ROLE" as any)
            ).rejects.toThrow("Указана несуществующая роль");
        });

        it("should throw if user not found after update", async () => {
            mockUpdate.mockResolvedValue(null);
            await expect(
                service.changeRole(admin as any, 2, Role.USER)
            ).rejects.toThrow("Пользователь не найден");
        });

        it("should deny non-admin", async () => {
            const user = { id: 2, role: Role.USER };
            await expect(
                service.changeRole(user as any, 3, Role.ADMIN)
            ).rejects.toThrow("У вас нет доступа к этому действию");
        });
    });
});
