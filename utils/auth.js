// utils/auth.js
export function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
        return false;
    }
    return true;
}
