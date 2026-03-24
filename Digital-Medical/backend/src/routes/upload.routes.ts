import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.js";
import { imageUpload, documentUpload } from "../middleware/upload.js";
import { uploadFile, deleteFile } from "../lib/storage.js";

const router = Router();

/** Handle multer errors gracefully */
function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    if (err.message.includes("File too large")) {
      res.status(413).json({ error: "File too large" });
      return;
    }
    if (err.message.includes("not allowed")) {
      res.status(400).json({ error: err.message });
      return;
    }
  }
  next(err);
}

// ── Upload an image (profile, cover, product, etc.) ──
router.post(
  "/image",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload.single("file")(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const rawFolder = typeof req.body.folder === "string" ? req.body.folder : "images";
      const folder = rawFolder.replace(/\.\.+/g, "").replace(/[^\w-]/g, "") || "images";
      const url = await uploadFile(req.file.buffer, req.file.originalname, folder);

      res.json({ url });
    } catch (err) {
      console.error("Image upload error:", err);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// ── Upload a document (license, resume, etc.) ──
router.post(
  "/document",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    documentUpload.single("file")(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const rawFolder = typeof req.body.folder === "string" ? req.body.folder : "documents";
      const folder = rawFolder.replace(/\.\.+/g, "").replace(/[^\w-]/g, "") || "documents";
      const url = await uploadFile(req.file.buffer, req.file.originalname, folder);

      res.json({ url });
    } catch (err) {
      console.error("Document upload error:", err);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// ── Delete a file by URL ──
router.delete(
  "/",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        res.status(400).json({ error: "url is required" });
        return;
      }

      await deleteFile(url);
      res.json({ message: "File deleted" });
    } catch (err) {
      console.error("File delete error:", err);
      res.status(500).json({ error: "Failed to delete file" });
    }
  }
);

export default router;
