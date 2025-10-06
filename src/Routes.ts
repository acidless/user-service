import express from "express";
import UserController from "./controller/UserController.js";
import AuthMiddleware from "./middlewares/AuthMiddleware.js";

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