const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/* =========================
   ENV VALIDATION (fail fast)
========================= */
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

const isProd = process.env.NODE_ENV === "production";

/* =========================
   HELPERS
========================= */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd, // true in production (HTTPS)
  });
};

/* =========================
   REGISTER
========================= */
async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    setCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
}

/* =========================
   LOGIN
========================= */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);
    setCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
}

/* =========================
   LOGOUT
========================= */
async function logoutUserController(req, res) {
  try {
    const token = req.cookies?.token;

    if (token) {
      await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({
      message: "Server error during logout",
    });
  }
}

/* =========================
   GET CURRENT USER
========================= */
async function getMeController(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ GetMe Error:", error);
    return res.status(500).json({
      message: "Server error while fetching user",
    });
  }
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};