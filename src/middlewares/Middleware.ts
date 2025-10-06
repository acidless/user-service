import express from "express";

abstract class Middleware {
    public abstract execute(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any>;
}

export default Middleware;