const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = 86400; // 24 hours in seconds

async function authGuest(display_name) {
    if (!display_name || typeof display_name !== 'string') {
        throw new Error('display_name is required');
    }

    // Trim whitespace and check if empty
    const name = display_name.trim();
    if (name.length === 0) {
        throw new Error('display_name cannot be empty');
    }

    if (name.length > 32) {
        throw new Error('display_name cannot exceed 32 characters');
    }

    // Generate a unique ID for this player
    const player_id = uuidv4();

    // Sign the JWT with the player's ID and display name
    const token = jwt.sign(
        { player_id, display_name: name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { player_id, display_name: name, token };
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}

module.exports = { authGuest, verifyToken };