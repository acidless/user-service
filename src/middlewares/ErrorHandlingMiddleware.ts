import express from "express";
import Middleware from "./Middleware";
import HttpError from "../HttpError";

class ErrorHandlingMiddleware extends Middleware {
    public async execute(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            next();
        } catch (error: any) {
            if (error instanceof HttpError) {
                return res.status(error.code).json({success: false, error: error.message});
            }

            return res.status(500).json({success: false, error: error.message});
        }
    }
}

export default ErrorHandlingMiddleware;