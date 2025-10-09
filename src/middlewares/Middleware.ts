import express from "express";

type MiddlewareFunction = (req: express.Request, res: express.Response, next: express.NextFunction) => any;
type ErrorHandlingMiddlewareFunction = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => any;

abstract class Middleware {
    public abstract execute: MiddlewareFunction | ErrorHandlingMiddlewareFunction;
}

export default Middleware;