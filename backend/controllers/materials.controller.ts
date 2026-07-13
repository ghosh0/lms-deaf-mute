import z from "zod";
import { asyncHandler } from "../middleware/error";
import { prisma } from "../lib/prisma";

const createMaterialSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

const updateMaterialSchema = createMaterialSchema.partial().omit({ lessonId: true });

export const getAllMaterials=()=>
{
    return asyncHandler(async (req, res) => {
        const lessonId = typeof req.query.lessonId === "string" ? req.query.lessonId : undefined;
        const materials = await prisma.studyMaterial.findMany({
          where: lessonId ? { lessonId } : undefined,
          orderBy: { createdAt: "asc" },
        });
        res.json(materials);
      })
}

export const getMaterialById=()=>
{
    return asyncHandler(async (req, res) => {
    const material = await prisma.studyMaterial.findUnique({ where: { id: req.params.id } });
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  })
}

export const getDownload=()=>
{
    return asyncHandler(async (req, res) => {
    const material = await prisma.studyMaterial.findUnique({ where: { id: req.params.id } });
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.redirect(material.fileUrl);
  })
}

export const adminCreateMaterial=()=>
{
    return asyncHandler(async (req, res) => {
    const data = createMaterialSchema.parse(req.body);
    const material = await prisma.studyMaterial.create({ data });
    res.status(201).json(material);
  })
}

export const adminUpdateMaterial=()=>
{
    return asyncHandler(async (req, res) => {
    const data = updateMaterialSchema.parse(req.body);
    const material = await prisma.studyMaterial.update({ where: { id: req.params.id }, data });
    res.json(material);
  })
}

export const adminDeleteMaterial=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.studyMaterial.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
}