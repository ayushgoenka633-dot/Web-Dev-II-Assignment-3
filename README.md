# Inventory Management System

## Overview
This project is an Inventory Management System built using Node.js, Express.js, and MongoDB. It provides REST API endpoints for managing product information and inventory stock.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript

## Project Structure
- `app.js` – Application entry point
- `config/` – Database configuration, if present
- `models/` – Product data model
- `routes/` – Product API routes
- `middleware/` – Error-handling middleware
- `package.json` – Dependencies and scripts

## Installation
1. Install Node.js and MongoDB.
2. Clone this repository.
3. Run `npm install`.
4. Create a `.env` file and set `MONGODB_URI` to your MongoDB connection string.
5. Run `npm start`.

## API
The API provides product and stock-management operations. Check `routes/productroutes.js` for the implemented endpoints.

## Note
Do not commit `.env` files or credentials to GitHub.
