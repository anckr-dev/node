# Express API Starter

Includes API Server utilities:

* [morgan](https://www.npmjs.com/package/morgan)
    * HTTP request logger middleware for node.js
* [helmet](https://www.npmjs.com/package/helmet)
    * Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
* [dotenv](https://www.npmjs.com/package/dotenv)
    * Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
* [cors] (https://www.npmjs.com/package/cors)
    * CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various option
* [http] (comes with node)
    * Using this connection, data sending and receiving can be done as long as connections use a hypertext transfer protocol
* [http-errors] (https://www.npmjs.com/package/http-errors)
    * Create HTTP errors for Express
* [winston] (https://www.npmjs.com/package/winston)
    * using for creating loggers
* [winston-daily-rotate-file] (https://www.npmjs.com/package/winston-daily-rotate-file)
    * using for managing loggers files. i.e., auto removing files, managing file sizes, date patterns etc.,
* [sequelize] (https://www.npmjs.com/package/sequelize)
    * Sequelize is an easy-to-use and promise-based Node.js ORM tool for Postgres
* [nodemon] (https://www.npmjs.com/package/nodemon)
    * nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in 
      the directory are detected.
* [path] (https://www.npmjs.com/package/path)
    * module provides utilities for working with file and directory paths
* [bcrypt] (https://www.npmjs.com/package/bcrypt)
    * bcrypt is a library to help you hash passwords.
* [nodemailer] (https://www.npmjs.com/package/nodemailer) // moved to sendGrid 
    * nodemailer is the 100% open-source and privacy-focused email service
* [randomatic] (https://www.npmjs.com/package/randomatic)
    * Generate randomized strings of a specified length using simple character sequences, using for email code
* [dotenv] (https://www.npmjs.com/package/dotenv)
    * DotEnv is a lightweight npm package that automatically loads environment variables from a .env file into the process.env object
* [jsonwebtoken] (https://www.npmjs.com/package/jsonwebtoken)
    * JSON Web Tokens is an authentication standard that works by assigning and passing around an encrypted token requests that helps to identify    the logged in user
* [Passport] (https://www.npmjs.com/package/passport)
    * Passport is a Node.js middleware that offers a variety of different request authentication strategies
* [Luxon] (https://www.npmjs.com/package/luxon)
    * Luxon is a library for working with dates and times in JavaScript.
* [@sendgrid/mail] (https://www.npmjs.com/package/@sendgrid/mail)
    * This is a dedicated service for interaction with the mail endpoint of the SendGrid v3 API.
* [password-validator] (https://www.npmjs.com/package/password-validator)
    * input validator, especially for password
* [aws-sdk] (https://www.npmjs.com/package/aws-sdk)
    * The preferred way to install the AWS SDK for Node.js
* [cookie-parser] (https://www.npmjs.com/package/cookie-parser)
    * Parse Cookie header and populate req.cookies with an object keyed by the cookie names


## Setup

```
npm install
```


## Setup database

```
Check .env files and update all information in the database
```

## Run Setup

```
npm start
(or)
npm run start
```

## Run Migrations

````````
npm run migrate
````````

## Undo Migrations

````````
npm run migrate:undo
````````

## Create Migrate
````````````
npx sequelize-cli model:generate --name <--model name--> --attributes <--model attributes-->
````````````
## Rome Lint (https://docs.rome.tools/lint/rules/)
`````````````````
npm run lint 
```````````````

## Code Formater (https://docs.rome.tools/lint/rules/)
`````````````````
npm run format
```````````````
## Rome Lint Auto fix (https://docs.rome.tools/lint/rules/)
````````````````````````
npm run auto-fix-lint
```````````````

## Code Formater Auto fix (https://docs.rome.tools/lint/rules/)
`````````````````````````
npm run auto-fix-format
`````````````````````````

## Swagger documentation
````````````````````````````
<your backendUrl> + /api-docs/
````````````````````````````
