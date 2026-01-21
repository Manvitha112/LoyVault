import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "loyvault-dev-secret";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    console.error("[authMiddleware] invalid token", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
