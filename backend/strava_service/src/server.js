import "./config/env.js";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Strava OAuth Service is running on port ${PORT}`);
});