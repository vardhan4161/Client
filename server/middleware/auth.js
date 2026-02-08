const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        console.log(`[AUTH] Request to ${req.method} ${req.url}`);
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.log('[AUTH] No token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, email }
        console.log(`[AUTH] Authenticated User: ${decoded.userId}`);
        next();
    } catch (error) {
        console.log('[AUTH] Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
