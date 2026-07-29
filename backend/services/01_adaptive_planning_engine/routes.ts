// backend_ts/services/01_adaptive_planning_engine/routes.ts

import { Router, Request, Response } from "express";
import { generateWorkoutRecommendation, DailyConditionInput } from "./recommend";

const router = Router();

router.post("/api/ai-recommendation", async (req: Request, res: Response) => {
    try {
        const input: DailyConditionInput = req.body;
        const result = generateWorkoutRecommendation(input);
        res.status(200).json(result);
    } catch (error) {
        console.error("AI recommendation error:", error);
        res.status(500).json({ status: "error", message: "Failed to generate recommendation" });
    }
});

export default router;
