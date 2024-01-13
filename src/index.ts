import express from "express";
import { PORT } from "./secret";
import rootRouter from "./routes";
import { errorMiddleware } from "./middlewares/errors";

const app = express();

app.use(express.json());

// Route
app.use("/api", rootRouter);

// It should after route
app.use(errorMiddleware);

app.listen(PORT, () => console.log("App running...", PORT));
