import express from "express";
import UserController from "./controllers/UserController.ts";
import AuthMiddleware from "./middlewares/AuthMiddleware.ts";

const router = express.Router();

router.route("/users")
    .post(UserController.register)
    .patch(UserController.login)
    .get(AuthMiddleware.execute, UserController.getUsers);

router.route("/users/:id")
    .get(AuthMiddleware.execute, UserController.getUserById)
    .delete(AuthMiddleware.execute, UserController.blockUser);

router.route("/users/:id/roles")
    .patch(AuthMiddleware.execute, UserController.changeUserRole);

export default router;