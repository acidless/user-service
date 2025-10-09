import express from "express";
import Middleware from "./Middleware.ts";
import HttpError from "../HttpError.ts";

class ErrorHandlingMiddleware extends Middleware {
    public execute = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err);

        if (err instanceof HttpError) {
            return res.status(err.code).json({ success: false, error: err.message });
        }

        const errorMessage = err.message || "Internal Server Error";
        return res.status(500).json({ success: false, error: errorMessage });
    }
}

export default new ErrorHandlingMiddleware();