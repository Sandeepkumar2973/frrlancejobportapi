import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import superAdminModel from "../models/superadminModel.js";
import MootUserModel from "../models/MootUserModel.js";
// Role constants
export const ROLES = {
  admin: "admin",
  user: "user",
  mootUser: "mootUser",
  superadmin: "superadmin",
};

// Dynamically select model based on role
const getModelByRole = (role) => {
  switch (role) {
    case ROLES.admin:
      return adminModel;
    case ROLES.superadmin:
      return superAdminModel;
    case ROLES.mootUser:
      return MootUserModel;
    default:
      return userModel;
  }
};

// 🔐 Middleware to check token
export const requireSignIn = async (req, res, next) => {
  try {
    // console.log('SECRET_KEY:', process.env.SECRET_KEY); // should not be undefined
    // console.log(req.headers.authorization, 'req.headers.authorization')

    const decode = JWT.verify(
      req.headers.authorization,
      process.env.SECRET_KEY
    );
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      message: "Unauthorized",
      error: "Invalid token",
    });
  }
};

// 🔑 Middleware to check role access
export const roleCheck = (roles) => {
  return async (req, res, next) => {
    try {
      const { _id, role } = req.user;
    //   console.log("Decoded JWT:", { _id, role }); // ✅ Add this

      const Model = getModelByRole(role);
      const user = await Model.findById(_id);
      // console.log("Fetched User from DB:", user); // ✅ Add this

      if (!user) {
        return res.status(404).send("User not found");
      }

      if (!roles.includes(role)) {
        return res
          .status(403)
          .send("Access Denied: You do not have the correct role");
      }

      req.userDetails = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  };
};
