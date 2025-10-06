import express from "express";

type MiddlewareFunction = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => any;

abstract class Middleware {
    public abstract execute: MiddlewareFunction;
}

export default Middleware;