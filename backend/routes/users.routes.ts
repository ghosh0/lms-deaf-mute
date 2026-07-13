import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { createUser, deleteUser, getAllUsers, getUserById } from "../controllers/users.controller.js";
import { updateUser } from "../controllers/users.controller.js";

const router = Router();

router.get(
  "/",
  getAllUsers()
);

router.post(
  "/",
  createUser()
);

router.get(
  "/:id",
  getUserById()
);

router.patch(
  "/:id",
  updateUser()
);

router.delete(
  "/:id",
  deleteUser()
);

export default router;
