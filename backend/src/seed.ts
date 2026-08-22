import bcrypt from "bcrypt";
import db from "./db";

const adminPassword = bcrypt.hashSync("Admin123!", 10);

db.get(
  "SELECT id FROM users WHERE email = ?",
  ["admin@example.com"],
  (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }

    if (!row) {
      db.run(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        ["Admin", "admin@example.com", adminPassword, "ADMIN"],
        (err) => {
          if (err) {
            console.error("Admin creation failed:", err.message);
          } else {
            console.log("Admin user created");
          }
        }
      );
    }
  }
);

db.get(
  "SELECT COUNT(*) AS count FROM vehicles",
  [],
  (err, row: any) => {
    if (err) {
      console.error(err.message);
      return;
    }

    if (row.count === 0) {
      const vehicles = [
        ["Toyota", "Camry", "Sedan", 32000, 5],
        ["Honda", "Civic", "Sedan", 28000, 3],
        ["Tesla", "Model 3", "Electric", 40000, 2],
        ["BMW", "X3", "SUV", 52000, 4],
        ["Hyundai", "Creta", "SUV", 22000, 6]
      ];

      const stmt = db.prepare(`
        INSERT INTO vehicles
        (make, model, category, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `);

      vehicles.forEach((vehicle) => {
        stmt.run(vehicle);
      });

      stmt.finalize(() => {
        console.log("Sample vehicles created");
      });
    }
  }
);