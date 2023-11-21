import express from "express";
import bcrypt from "bcrypt";
import {
  addUser,
  forgotPassword,
  generateToken,
  getUser,
  getUserByID,
  resetPassword,
  generateActivationToken,
  activateAccount,
  generateUserToken,
  activationMail,
} from "../Controllers/userController.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

const EMAIL = process.env.EMAIL;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  // Configuring mail service for sending emails
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: process.env.PASS,
  },
});

// Route to get a user by email
router.get("/getUser", async (req, res) => {
  try {
    // Retrieve user by email
    console.log("get a user");

    const user = await getUser(req.body);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get a user by ID
router.get("/getUserId/:id", async (req, res) => {
  try {
    // Retrieve user by ID
    const { id } = req.params;
    console.log("get a user id");
    const user = await getUserByID(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to sign up a new user
router.post("/signup", async (req, res) => {
  try {
    // Add a new user to the database
    console.log("adding user");
    const salt = await bcrypt.genSalt(10);
    const user = await getUser({ email: req.body.email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const activationKey = Math.random().toString(36).substring(2, 9);
      const hashedUser = await {
        ...req.body,
        password: hashedPassword,
        isActivated: false,
        activationKey: activationKey,
      };
      const result = await addUser(hashedUser);

      const secret = activationKey;
      const token = generateActivationToken(hashedUser._id, secret);

      const link = `https://url-shortner-frontend-task-guvi.netlify.app/activate/${hashedUser._id}?activateToken=${token}`;
      const mailOptions = {
        from: EMAIL,
        to: hashedUser.email,
        subject: "Account Activation link sent",
        text: `Click on the below link to activate your account. This link is valid for 48 hours after which link will be invalid. ${link}`,
      };

      if (!result.acknowledged) {
        return res
          .status(404)
          .json({ message: "Error uploading user information" });
      } else {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("Email not sent", error);
            return res.status(400).send({
              message: "Error sending email",
              result: result.acknowledged,
            });
          } else {
            console.log("Email sent: " + info.response);
            return res.status(200).send({
              result: result.acknowledged,
              message: "Activation link sent",
              data: hashedUser.email,
            });
          }
        });
      }
    } else {
      return res.status(400).json({ message: "Email already exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to resend activation for account
router.post("/activation", async (req, res) => {
  try {
    // Resend activation for an account
    console.log("resend activation");
    const user = await getUser({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }
    if (!user.isActivated) {
      const activationKey = Math.random().toString(36).substring(2, 9);
      const result = await activationMail(req.body.email, {
        isActivated: false,
        activationKey: activationKey,
      });

      const secret = activationKey;
      const token = generateActivationToken(user._id, secret);

      const link = `https://url-shortner-frontend-task-guvi.netlify.app/activate/${user._id}?activateToken=${token}`;
      const mailOptions = {
        from: EMAIL,
        to: user.email,
        subject: "Account Activation link sent",
        text: `Click on the below link to activate your account. This link is valid for 48 hours after which link will be invalid. ${link}`,
      };

      if (!result.lastErrorObject.updatedExisting) {
        return res
          .status(404)
          .json({ message: "Error sending activation mail" });
      } else {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("Email not sent", error);
            return res.status(400).send({
              message: "Error sending email",
              result: result.lastErrorObject.updatedExisting,
            });
          } else {
            console.log("Email sent: " + info.response);
            return res.status(200).send({
              result: result.lastErrorObject.updatedExisting,
              message: "Activation link sent",
              data: user.email,
            });
          }
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: `Account already activated ${user.isActivated}` });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to activate an account using ID and token
router.post("/activate/:id/:token", async (req, res) => {
  try {
    // Activate user account using provided ID and token
    console.log("activating account");
    const { id, token } = req.params;

    if (!id) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (!token) {
      return res.status(404).json({ message: "Invalid authorization" });
    }
    const user = await getUserByID(id);
    if (!user) {
      return res.status(404).json({ message: "Invalid account" });
    }
    try {
      const decode = jwt.verify(token, user.activationKey);
      //console.log(decode);
      if (decode.id && req.body.isActivated) {
        const result = await activateAccount(user.email, {
          isActivated: true,
          activationKey: "",
        });
        if (!result.lastErrorObject.updatedExisting) {
          return res.status(400).json({ message: "Error activating account" });
        } else {
          console.log("account activated");
          return res.status(200).json({
            decode: decode,
            message: "Account activated",
            result: result,
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Token error", error: err });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for forgot password functionality
router.post("/forgot-password", async (req, res) => {
  try {
    // Implement forgot password functionality
    const user = await getUser(req.body);
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }

    const secret = Math.random().toString(36).substring(2, 11);
    const token = generateToken(user._id, secret);

    const link = `https://url-shortner-frontend-task-guvi.netlify.app/authorize/?id=${user._id}&token=${token}`;
    const mailOptions = {
      from: EMAIL,
      to: user.email,
      subject: "Password reset link sent",
      text: `Click on the below link to reset your password. This password reset link is valid for 10 minutes after which link will be invalid. ${link}`,
    };
    const result = await forgotPassword(user.email, { password: secret });
    if (!result.lastErrorObject.updatedExisting) {
      return res.status(400).json({ message: "Error setting verification" });
    } else {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email not sent", error);
          res.status(400).send({
            message: "Error sending email",
            reset: result.lastErrorObject.updatedExisting,
          });
        } else {
          console.log("Email sent: " + info.response);
          res
            .status(200)
            .send({ result: result.lastErrorObject.updatedExisting });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to authorize forgot password functionality with ID and token
router.get("/forgot-password/authorize/:id/:token", async (req, res) => {
  try {
    // Authorize forgot password functionality using ID and token
    const { id, token } = req.params;
    console.log("veifying token");
    if (!id) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (!token) {
      return res.status(404).json({ message: "Invalid authorization" });
    }
    const user = await getUserByID(id);
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      const decode = jwt.verify(token, user.password);
      //console.log(decode);
      if (decode.id) {
        res.status(200).json({ decode: decode });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Token error", error: err });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to reset password for a specific user
router.post("/reset-password/:id", async (req, res) => {
  try {
    // Reset password for a user using ID
    const { id } = req.params;
    const user = await getUserByID(id);
    const salt = await bcrypt.genSalt(10);
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const result = await resetPassword(id, { password: hashedPassword });
    if (!result.lastErrorObject.updatedExisting) {
      return res.status(400).json({ message: "Error resetting password" });
    }
    res
      .status(200)
      .send({ result: result.lastErrorObject.updatedExisting, user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  try {
    // Implement user login functionality
    console.log("user login..");

    const user = await getUser({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    if (!user.isActivated) {
      return res.status(404).json({ message: "Account not activated" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = generateUserToken(user._id, process.env.SECRET_KEY);
    res.status(200).json({
      data: {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        id: user._id,
      },
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const userRouter = router;
