import { client } from "../db.js"; 
import { ObjectId } from "bson";
import jwt from "jsonwebtoken";

// Function to add a new user to the database
export function addUser(data) {
  return client.db("URLuserData").collection("users").insertOne(data);
}

// Function to retrieve a user from the database
export function getUser(data) {
  return client.db("URLuserData").collection("users").findOne(data);
}

// Function to retrieve a user by ID from the database
export function getUserByID(id) {
  return client
    .db("URLuserData")
    .collection("users")
    .findOne({ _id: new ObjectId(id) });
}

// Function to reset a user's password in the database
export function resetPassword(id, data) {
  return client
    .db("URLuserData")
    .collection("users")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data });
}

// Function to update activation mail status for a user in the database
export function activationMail(email, data) {
  return client
    .db("URLuserData")
    .collection("users")
    .findOneAndUpdate({ email: email }, { $set: data });
}

// Function to handle forgot password for a user in the database
export function forgotPassword(email, data) {
  return client
    .db("URLuserData")
    .collection("users")
    .findOneAndUpdate({ email: email }, { $set: data });
}

// Function to activate a user's account in the database
export function activateAccount(email, data) {
  return client
    .db("URLuserData")
    .collection("users")
    .findOneAndUpdate({ email: email }, { $set: data });
}

// Function to generate a token with a specified expiration time
export function generateToken(id, secret) {
  return jwt.sign({ id }, secret, { expiresIn: "10m" });
}

// Function to generate an activation token with a specified expiration time
export function generateActivationToken(id, secret) {
  return jwt.sign({ id }, secret, { expiresIn: "2d" });
}

// Function to generate a user token with a specified expiration time
export function generateUserToken(id, secret) {
  return jwt.sign({ id }, secret, { expiresIn: "1d" });
}
