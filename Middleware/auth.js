import jwt from "jsonwebtoken";

// Middleware function
export function isAuthenticated(req, res, next) {
  const token = req.headers["x-auth-token"];

  // Handling missing token scenario
  if (!token) {
    return res.status(400).json({ message: "Invalid Authorization" });
  }

  // Verifying and decoding the token using the provided secret key
  const decode = jwt.verify(token, process.env.SECRET_KEY);

  // Passing control to the next middleware if authentication is successful
  next();
}
