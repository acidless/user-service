import express from "express";
import ErrorHandlingMiddleware from "../../src/middlewares/ErrorHandlingMiddleware.ts";
import HttpError from "../../src/HttpError.ts";

jest.spyOn(console, "error").mockImplementation(() => {});

describe("ErrorHandlingMiddleware", () => {
    let req: Partial<express.Request>;
    let res: Partial<express.Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        next = jest.fn();

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should handle HttpError correctly", () => {
        const error = new HttpError(400, "Bad Request");

        ErrorHandlingMiddleware.execute(error, req as express.Request, res as express.Response, next);

        expect(console.error).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Bad Request"
        });
    });

    it("should handle generic Error correctly", () => {
        const error = new Error("Something went wrong");

        ErrorHandlingMiddleware.execute(error, req as express.Request, res as express.Response, next);

        expect(console.error).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Something went wrong"
        });
    });

    it("should handle unknown error object without message", () => {
        const error = {};

        ErrorHandlingMiddleware.execute(error, req as express.Request, res as express.Response, next);

        expect(console.error).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Internal Server Error"
        });
    });
});