import express from "express";

import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars
} from "../controllers/carController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getCars);

router.get(
  "/my-cars",
  authMiddleware,
  getMyCars
);

router.get("/:id", getCarById);

router.post(
  "/",
  authMiddleware,
  createCar
);

router.put(
  "/:id",
  authMiddleware,
  updateCar
);

router.delete(
  "/:id",
  authMiddleware,
  deleteCar
);

export default router;
