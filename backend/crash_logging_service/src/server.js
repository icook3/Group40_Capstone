import "./config/env.js";
import app from "./app.js";
import logger from "./util/logger.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info("server_started", {port: PORT});
});

server.on("error", (err) => {
    logger.error("server_start_failed", { error: err.message });
    process.exit(1);
});