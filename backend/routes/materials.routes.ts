import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { adminCreateMaterial, adminDeleteMaterial, adminUpdateMaterial, getAllMaterials, getDownload, getMaterialById } from "../controllers/materials.controller.js";

const router = Router();

// List materials, optionally by lesson (public)
router.get(
  "/",
  getAllMaterials()
);

// Get one (public)
router.get(
  "/:id",
  getMaterialById()
);

// Download redirect helper (public): redirects to underlying fileUrl.
router.get(
  "/:id/download",
  getDownload()
);

// Admin: create
router.post(
  "/",
  adminCreateMaterial()
);

// Admin: update
router.patch(
  "/:id",
  adminUpdateMaterial()
);

// Admin: delete
router.delete(
  "/:id",
  adminDeleteMaterial()
);

export default router;