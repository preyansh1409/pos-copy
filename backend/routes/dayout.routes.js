import express from "express";
import { saveDayoutReport, getDayoutReports, deleteDayoutReport } from "../controllers/dayout.controller.js";

const router = express.Router();

router.post("/save", saveDayoutReport);
router.get("/all", getDayoutReports);
router.delete("/delete/:id", deleteDayoutReport);

export default router;
