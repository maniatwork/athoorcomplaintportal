import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");
  
  if (token && token.startsWith("Bearer ")) {
    token = token.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: "No token provided. Authorization denied." });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }
    
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ message: "Token is invalid or has expired." });
  }
};

export default authMiddleware;
