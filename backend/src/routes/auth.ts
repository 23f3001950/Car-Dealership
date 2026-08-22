import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  try {
    // Check duplicate email
    db.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Database error"
          });
        }

        if (existingUser) {
          return res.status(409).json({
            message: "Email already registered"
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        db.run(
          `INSERT INTO users (name, email, password_hash, role)
           VALUES (?, ?, ?, 'USER')`,
          [name, email, passwordHash],
          function (err) {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Failed to create user"
              });
            }

            return res.status(201).json({
              message: "User registered successfully",
              user: {
                id: this.lastID,
                name,
                email,
                role: "USER"
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
});
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const jwt = require("jsonwebtoken");

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || "development-secret",
        {
          expiresIn: "1d"
        }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});

export default router;