import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

import {
    canMakeCall,
    recordCall,
    getStatus
} from "../util/rateLimits.js";

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

// Rate limit status endpoint
router.get("/count", (_req, res) => {
    res.json(getStatus());
});

// Upload Activity endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                error: "Missing access token"
            });
        }

        if (!canMakeCall()) {
            return res.status(429).json({
                error: "Strava rate limit exceeded"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "Missing file"
            });
        }


        const {
            name,
            description,
            trainer,
            commute,
            data_type,
            external_id
        } = req.body;

        const form = new FormData();
        form.append("file", req.file.buffer, req.file.originalname);
        form.append("name", name);
        form.append("description", description);
        form.append("trainer", trainer ?? "0");
        form.append("commute", commute ?? "0");
        form.append("data_type", data_type ?? "tcx");
        form.append("external_id", external_id ?? `zlow-${Date.now()}`);

        const response = await axios.post(
            "https://www.strava.com/api/v3/uploads",
            form,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    ...form.getHeaders()
                },
                timeout: 15000
            }
        );

        recordCall();
        return res.json(response.data);
    } catch (err) {
        console.error(
            "Strava upload failed: ",
            err?.response?.data || err.message
        );

        return res.status(500).json({
            error: "Strava upload failed",
            details: err?.response?.data
        });
    }
});


export default router;