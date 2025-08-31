import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import notfound from "./app/middlewares/notFoundRoute";
import { globalErrorHandlers } from "./app/middlewares/globalErrorHandler";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Digital Wallet API");
});
app.use(globalErrorHandlers);
app.use(notfound);

export default app;
