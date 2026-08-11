require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

connectDB();

const app = express();

const authRoutes = require("./src/routes/authRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const distributorRoutes = require("./src/routes/distributorRoutes");
const oemRoutes = require("./src/routes/oemRoutes");
const quotationRoutes = require("./src/routes/quotationRoutes");
const followUpRoutes = require("./src/routes/followUpRoutes");
const emailRoutes = require("./src/routes/emailRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const userRoutes = require("./src/routes/userRoutes");


app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/oems", oemRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CRM backend running on port ${PORT}`));
