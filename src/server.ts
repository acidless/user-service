import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import Routes from "./Routes.js";
import ErrorHandlingMiddleware from "./middlewares/ErrorHandlingMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cookieParser());
app.use(express.json());

app.use("/api", Routes);
app.use(ErrorHandlingMiddleware.execute);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});