import AuthMiddleware from "../../src/middlewares/AuthMiddleware.ts";
import HttpError from "../../src/HttpError.ts";
import { Status } from "../../src/generated/prisma/enums.ts";

jest.mock("../../src/generated/prisma/client.ts");

jest.mock("../../src/JWT.ts", () => ({
    jwtVerify: jest.fn(),
}));

jest.mock("../../src/models/UserModel.ts", () => {
    return jest.fn().mockImplementation(() => ({
        findOne: jest.fn(),
    }));
});

import { jwtVerify } from "../../src/JWT.ts";
import UserModel from "../../src/models/UserModel.ts";

describe("AuthMiddleware", () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;
    let middleware: any;
    let mockFindOne: jest.Mock;

    beforeEach(() => {
        mockReq = { cookies: {} };
        mockRes = {};
        mockNext = jest.fn();

        middleware = AuthMiddleware;
        const userModelInstance = (UserModel as jest.Mock).mock.results[0].value;
        mockFindOne = userModelInstance.findOne;
    });

    it("should throw if jwtVerify returns null (no or invalid token)", async () => {
        (jwtVerify as jest.Mock).mockReturnValue(null);

        await expect(middleware.execute(mockReq, mockRes, mockNext))
            .rejects.toThrow(HttpError);

        await expect(middleware.execute(mockReq, mockRes, mockNext))
            .rejects.toThrow("Вы не авторизованы");

        expect(mockFindOne).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw if jwtVerify returns object without id", async () => {
        (jwtVerify as jest.Mock).mockReturnValue({});

        await expect(middleware.execute(mockReq, mockRes, mockNext))
            .rejects.toThrow("Вы не авторизованы");

        expect(mockFindOne).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw if user not found", async () => {
        (jwtVerify as jest.Mock).mockReturnValue({ id: 1 });
        mockFindOne.mockResolvedValue(null);

        await expect(middleware.execute(mockReq, mockRes, mockNext))
            .rejects.toThrow("Неверный токен");

        expect(mockFindOne).toHaveBeenCalledWith({ id: 1 });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw if user is blocked", async () => {
        (jwtVerify as jest.Mock).mockReturnValue({ id: 1 });
        mockFindOne.mockResolvedValue({ id: 1, status: Status.BLOCKED });

        await expect(middleware.execute(mockReq, mockRes, mockNext))
            .rejects.toThrow("Ваш аккаунт заблокирован");

        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should set req.user and call next() if auth is valid", async () => {
        (jwtVerify as jest.Mock).mockReturnValue({ id: 1 });
        const mockUser = { id: 1, name: "Alice", status: Status.ACTIVE };
        mockFindOne.mockResolvedValue(mockUser);

        await middleware.execute(mockReq, mockRes, mockNext);

        expect(mockReq.user).toEqual(mockUser);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });
});
