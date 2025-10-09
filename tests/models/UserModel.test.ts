import UserModel from "../../src/models/UserModel.ts";
import {Role} from "../../src/generated/prisma/client.ts";
import {UserRegisterDTO} from "../../src/validators/userValidator.ts";

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();

jest.mock("../../src/generated/prisma/client.ts", () => ({
    Role: {ADMIN: "ADMIN", USER: "USER"},
    Status: {ACTIVE: "ACTIVE", BLOCKED: "BLOCKED"},
}));

jest.mock("../../src/models/Model.ts", () => {
    return class MockModel {
        db = {
            prisma: () => ({
                user: {
                    create: mockCreate,
                    findUnique: mockFindUnique,
                    findMany: mockFindMany,
                    update: mockUpdate
                }
            })
        };
        validate = jest.fn();
    };
});

describe("UserModel", () => {
    let model: UserModel;

    beforeEach(() => {
        jest.clearAllMocks();
        model = new UserModel();
    });

    it("should create user", async () => {
        const data: UserRegisterDTO = {
            fullname: "Oleg",
            email: "user@example.com",
            password: "pass"
        };

        await model.create(data);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                ...data,
                role: Role.USER
            }
        });
    });

    it("should create admin if ADMIN_EMAIL was provided", async () => {
        process.env.ADMIN_EMAIL = "admin@example.com";

        const data: UserRegisterDTO = {
            fullname: "Admin",
            email: "admin@example.com",
            password: "pass"
        };

        await model.create(data);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                ...data,
                role: Role.ADMIN
            }
        });
    });

    it("should call findOne with filters", async () => {
        const filter = {id: 42};
        await model.findOne(filter);
        expect(mockFindUnique).toHaveBeenCalledWith({where: {id: 42}});
    });

    it("should call getUsers with params", async () => {
        await model.getUsers(10, 20);
        expect(mockFindMany).toHaveBeenCalledWith({skip: 10, take: 20});
    });

    it("should update the user", async () => {
        const user = {fullname: "Updated"};
        await model.update(5, user);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: {id: 5},
            data: user
        });
    });
});
