import express from "express";

import {
  createComment,
  getCarComments,
  deleteComment
} from "../controllers/commentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createComment
);

router.get(
  "/car/:carId",
  getCarComments
);

router.delete(
  "/:id",
  authMiddleware,
  deleteComment
);

export default router;