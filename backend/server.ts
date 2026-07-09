import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.ts";
import catalogRouter from "./routes/catalog.routes.ts";
import coursesRouter from "./routes/courses.routes.ts";
import lessonsRouter from "./routes/lessons.routes.ts";
import materialsRouter from "./routes/materials.routes.ts";
import quizzesRouter from "./routes/quizzes.routes.ts";
import usersRouter from "./routes/users.routes.ts";
import { seedAdminUser, seedApplicationData } from "./lib/catalog.ts";
import { errorHandler, notFound } from "./middleware/error.js";

const port = process.env.PORT || 5000
const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL?.split(",").map((value) => value.trim()) ?? true,
        credentials: true,
    })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/users", usersRouter);

async function bootstrap() {
    await seedApplicationData();
    await seedAdminUser();

    app.use(notFound);
    app.use(errorHandler);

    app.listen(port, () => {
            console.log(`Learning app backend listening on http://localhost:${port}`);
    });
}

bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
});
