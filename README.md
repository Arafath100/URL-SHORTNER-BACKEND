# URL Shortener Backend

This repository contains the backend component of a URL shortener application built using Node.js, Express, and MongoDB.

## Introduction

This backend server provides essential functionality for URL shortening, user authentication, and data management, enabling users to create shortened URLs and manage their accounts securely.

## Features

- URL Shortening: Shorten long URLs into manageable links.
- User Authentication: Handle user registration, login, and account management.
- Database Management: Store URL data and user information using MongoDB.

## Prerequisites

- Node.js and npm installed on your machine.
- MongoDB installed and running locally or remotely.
- Environment variables set up using a `.env` file.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Arafath100/URL-SHORTNER-BACKEND.git

2. Install dependencies:
 
    ```bash
    cd url-shortener-backend
    npm install

## Configuration

 1. Create a .env file in the root directory.

 2. Add the following environment variables:
 
    ```bash
    MONGO_URL=your_mongodb_connection_string
    SECRET_KEY=your_secret_key_for_jwt
    PORT=3000
    # Add other necessary environment variables

## Usage

To start the server, run:

    npm start

The server will start on port 3000 or the specified port in the `.env` file.


## Contributing

Contributions are welcome! If you find any issues or want to enhance the project, feel free to open an issue or create a pull request.

## License

 This project is licensed under the [MIT License](LICENSE).




   

