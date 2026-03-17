const authenticateReportService = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.slice(7);

    if (!process.env.REPORT_API_KEY) {
        console.error("REPORT_API_KEY not set");
        return res.status(500).json({ message: "Server misconfiguration" });
    }

    if (token !== process.env.REPORT_API_KEY) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};

export default authenticateReportService;