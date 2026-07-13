import z from "zod";
import { asyncHandler } from "../middleware/error";
import { prisma } from "../lib/prisma";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
});

export const getAllUsers=()=>
{
    return asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(users);
  })
}

export const createUser=()=>
{
    return asyncHandler(async (req, res) => {
    const data = createUserSchema.parse(req.body);
    const user = await prisma.user.create({ data });
    res.status(201).json(user);
  })
}

export const getUserById=()=>
{
    return asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  })
}

export const updateUser=()=>
{
    return asyncHandler(async (req, res) => {
    const data = createUserSchema.partial().parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json(user);
  })
}

export const deleteUser=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
}