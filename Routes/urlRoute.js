import express from "express";
import {
  addURL,
  getURL,
  getAllURL,
  urlDayCount,
  urlMonthCount,
  updateCount,
} from "../Controllers/urlController.js";

const router = express.Router();

// Route to create a shortened URL
router.post("/createURL", async (req, res) => {
  try {
    // Function to generate a random short ID
    function generateShortId(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      const charactersLength = characters.length;

      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

    // Generate a short URL and associate it with the provided data
    const id = generateShortId(7);
    console.log("Generated ID:", id);
    const shortURL = "/" + id;
    const data = { ...req.body, shortURL: shortURL, urlID: id, clicked: 0 };

    // Add URL to the database
    const result = await addURL(data);

    // Handle errors during URL addition
    if (!result.acknowledged) {
      return res
        .status(404)
        .json({ message: "Error uploading user information" });
    }
    res.status(200).json({ result: result, data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to retrieve all URLs associated with a user
router.post("/all", async (req, res) => {
  try {
    // Retrieve all URLs for a given user email
    console.log("get all url");
    if (!req.body.email) {
      return res.status(400).json({ message: "User not found" });
    }
    const urlList = await getAllURL(req.body.email);

    if (!urlList) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json({ data: urlList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to retrieve URLs accessed by a user today
router.post("/today", async (req, res) => {
  console.log("get all url today");
  if (!req.body.email) {
    return res.status(400).json({ message: "User not found" });
  }
  try {
    // Retrieve URLs accessed by a user today
    const urlList = await urlDayCount(req.body.email, req.body.today);

    if (!urlList) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json({ data: urlList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to retrieve URLs accessed by a user this month
router.post("/monthly", async (req, res) => {
  console.log("get all url this month");
  try {
    // Retrieve URLs accessed by a user this month
    const urlList = await urlMonthCount(req.body.email, req.body.date);

    if (!urlList) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json({ data: urlList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to update the click count of a URL
router.post("/clickcount", async (req, res) => {
  console.log("update click count");
  try {
    // Update click count for a specific URL
    const updatedURL = await updateCount(req.body.id);

    if (!updatedURL) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json({ data: updatedURL });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const urlRouter = router;
