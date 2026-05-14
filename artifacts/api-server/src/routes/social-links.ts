import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, socialLinksTable, SOCIAL_LINKS_ROW_ID } from "@workspace/db";
import type { SocialLinksRow } from "@workspace/db";
import { UpdateSocialLinksBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

type SocialLinksDto = {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
};

const EMPTY: SocialLinksDto = {
  instagram: null,
  facebook: null,
  linkedin: null,
  tiktok: null,
};

function serialize(row: SocialLinksRow | undefined): SocialLinksDto {
  if (!row) return { ...EMPTY };
  return {
    instagram: row.instagram,
    facebook: row.facebook,
    linkedin: row.linkedin,
    tiktok: row.tiktok,
  };
}

function normalize(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

router.get("/social-links", async (_req, res) => {
  const [row] = await db
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.id, SOCIAL_LINKS_ROW_ID));
  res.json(serialize(row));
});

router.put("/admin/social-links", requireAdmin, async (req, res) => {
  const parsed = UpdateSocialLinksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid social links input" });
    return;
  }
  const values = {
    instagram: normalize(parsed.data.instagram),
    facebook: normalize(parsed.data.facebook),
    linkedin: normalize(parsed.data.linkedin),
    tiktok: normalize(parsed.data.tiktok),
    updatedAt: new Date(),
  };
  const [row] = await db
    .insert(socialLinksTable)
    .values({ id: SOCIAL_LINKS_ROW_ID, ...values })
    .onConflictDoUpdate({
      target: socialLinksTable.id,
      set: values,
    })
    .returning();
  res.json(serialize(row));
});

export default router;
