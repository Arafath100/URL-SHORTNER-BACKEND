import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./Routes/userRoute.js";
import { urlRouter } from "./Routes/urlRoute.js";
import { isAuthenticated } from "./Middleware/auth.js";
import { getURL } from "./Controllers/urlController.js";

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

// Define routes
app.use("/user", userRouter);
app.use("/url", isAuthenticated, urlRouter);

// Default route response
app.get("/", (req, res) => {
  res.send({ msg: "URL SHORTNER" });
});

// Redirect shortened URL to original URL
app.get("/:urlID", async (req, res) => {
  try {
    const url = await getURL({ urlID: req.params.urlID });
    if (url) {
      console.log("redirecting");
      return res.status(200).json({ longURL: url.longURL });
      // return res.redirect(url.longURL)
    } else {
      return res.status(404).json({ message: "No URL Found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});

// Start server
app.listen(PORT, () => console.log(`Server is running on PORT:${PORT}`));
