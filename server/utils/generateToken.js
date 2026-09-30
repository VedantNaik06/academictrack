import jwt from "jsonwebtoken";

// Creates a signed token that contains only the user's id
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export default generateToken;