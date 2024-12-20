import express from "express";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

import { connectDb } from "./data/database.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import cors from "cors";
const app = express();

config({
  path: "./data/config.env",
});
connectDb;
// using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL); // Specific domain
  res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allowed HTTP methods
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
  next();
});
//using routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin", productRouter);
app.use("/api/v1/user", cartRouter);

app.get("/", (req, res) => {
  res.send("started");
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(
    `server is running on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});