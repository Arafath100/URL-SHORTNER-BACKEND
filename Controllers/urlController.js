import { client } from "../db.js"; 
import { ObjectId } from "bson"; 
import jwt from "jsonwebtoken";

// Function to add a URL to the database
export function addURL(data) {
  return client.db("URLData").collection("url").insertOne(data);
}

// Function to retrieve a URL from the database
export function getURL(data) {
  return client.db("URLData").collection("url").findOne(data);
}

// Function to retrieve all URLs associated with a user
export function getAllURL(email) {
  return client.db("URLData").collection("url").find({ user: email }).toArray();
}

// Function to count URLs created by a user on a specific day
export function urlDayCount(email, today) {
  return client
    .db("URLData")
    .collection("url")
    .find({ user: email, createdOn: { $eq: today } })
    .toArray();
}

// Function to count URLs created by a user within a specific month
export function urlMonthCount(email, date) {
  return client
    .db("URLData")
    .collection("url")
    .find({ user: email, createdOn: { $gte: date } })
    .toArray();
}

// Function to update the click count of a URL by ID
export function updateCount(id) {
  return client
    .db("URLData")
    .collection("url")
    .findOneAndUpdate(
      { urlID: id },
      { $inc: { clicked: 1 } },
      { returnDocument: "after" }
    );
}
