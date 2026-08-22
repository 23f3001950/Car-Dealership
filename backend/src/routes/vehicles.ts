import { Router } from "express";
import db from "../db";
import {
  authenticate,
  requireAdmin,
  AuthRequest
} from "../middleware/auth";

const router = Router();
router.get("/test", (_req, res) => {
  res.json({ message: "Vehicle router works" });
});

/*
 * GET /api/vehicles
 * Public endpoint
 */
router.get("/", (_req, res) => {
  db.all(
    "SELECT * FROM vehicles ORDER BY id DESC",
    [],
    (err, vehicles) => {
      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      return res.json(vehicles);
    }
  );
});

/*
 * GET /api/vehicles/search
 */
router.get("/search", (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query;

  let query = `
    SELECT * FROM vehicles
    WHERE 1 = 1
  `;

  const params: any[] = [];

  if (make) {
    query += " AND LOWER(make) LIKE LOWER(?)";
    params.push(`%${make}%`);
  }

  if (model) {
    query += " AND LOWER(model) LIKE LOWER(?)";
    params.push(`%${model}%`);
  }

  if (category) {
    query += " AND LOWER(category) LIKE LOWER(?)";
    params.push(`%${category}%`);
  }

  if (minPrice) {
    query += " AND price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    query += " AND price <= ?";
    params.push(Number(maxPrice));
  }

  query += " ORDER BY id DESC";

  db.all(query, params, (err, vehicles) => {
    if (err) {
      return res.status(500).json({
        message: "Database error"
      });
    }

    return res.json(vehicles);
  });
});

/*
 * POST /api/vehicles
 * ADMIN ONLY
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  (req: AuthRequest, res) => {
    const {
      make,
      model,
      category,
      price,
      quantity
    } = req.body;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message: "All vehicle fields are required"
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        message: "Price and quantity cannot be negative"
      });
    }

    db.run(
      `INSERT INTO vehicles
       (make, model, category, price, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [
        make,
        model,
        category,
        Number(price),
        Number(quantity)
      ],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Failed to create vehicle"
          });
        }

        return res.status(201).json({
          message: "Vehicle created successfully",
          vehicle: {
            id: this.lastID,
            make,
            model,
            category,
            price: Number(price),
            quantity: Number(quantity)
          }
        });
      }
    );
  }
);

/*
 * PUT /api/vehicles/:id
 * ADMIN ONLY
 */
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  (req, res) => {
    const { id } = req.params;
    const {
      make,
      model,
      category,
      price,
      quantity
    } = req.body;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message: "All vehicle fields are required"
      });
    }

    db.run(
      `UPDATE vehicles
       SET make = ?,
           model = ?,
           category = ?,
           price = ?,
           quantity = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        make,
        model,
        category,
        Number(price),
        Number(quantity),
        id
      ],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Failed to update vehicle"
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            message: "Vehicle not found"
          });
        }

        return res.json({
          message: "Vehicle updated successfully"
        });
      }
    );
  }
);

/*
 * DELETE /api/vehicles/:id
 * ADMIN ONLY
 */
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  (req, res) => {
    db.run(
      "DELETE FROM vehicles WHERE id = ?",
      [req.params.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete vehicle"
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            message: "Vehicle not found"
          });
        }

        return res.json({
          message: "Vehicle deleted successfully"
        });
      }
    );
  }
);

/*
 * POST /api/vehicles/:id/purchase
 * AUTHENTICATED USER
 */
router.post(
  "/:id/purchase",
  authenticate,
  (req: AuthRequest, res) => {
    db.run(
      `UPDATE vehicles
       SET quantity = quantity - 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND quantity > 0`,
      [req.params.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Purchase failed"
          });
        }

        if (this.changes === 0) {
          return res.status(400).json({
            message: "Vehicle unavailable or out of stock"
          });
        }

        return res.json({
          message: "Vehicle purchased successfully"
        });
      }
    );
  }
);

/*
 * POST /api/vehicles/:id/restock
 * ADMIN ONLY
 */
router.post(
  "/:id/restock",
  authenticate,
  requireAdmin,
  (req, res) => {
    const quantity = Number(req.body.quantity);

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Restock quantity must be greater than zero"
      });
    }

    db.run(
      `UPDATE vehicles
       SET quantity = quantity + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quantity, req.params.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Restock failed"
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            message: "Vehicle not found"
          });
        }

        return res.json({
          message: "Vehicle restocked successfully"
        });
      }
    );
  }
);

export default router;