const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes/index');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_DATABASE || 'ibosDB';
const port = process.env.PORT || 5000;
const url = `${host}`;
mongoose.connect(url)
  .then(() => console.log(`Connected to Database: `))
  .catch(err => console.log('Error: Connection Failed', err));

  
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // To use cookie to parse the token

app.use('/', routes);

// Run server
app.listen(port, () => console.log(`Server Started on port ${port} http://localhost:${port}`));
