import {Request, Response, NextFunction} from "express";
import Middleware from "./Middleware.js";
import {ZodObject, ZodRawShape} from "zod";

class InputValidateMiddleware extends Middleware {
    private schema: ZodObject<ZodRawShape> | null = null;

    public useSchema(schema: ZodObject<ZodRawShape>) {
        this.schema = schema;
        return this.execute.bind(this);
    }

    public execute = (req: Request, res: Response, next: NextFunction) => {
        if (!this.schema) {
            throw new Error("No schema provided for InputValidateMiddleware");
        }

        const result = this.schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(e => ({
                field: e.path.join("."),
                message: e.message,
            }));

            return res.status(400).json({success: false, errors});
        }

        req.body = result.data;
        next();
    }
}

export default new InputValidateMiddleware();