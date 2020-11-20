const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mysql = require('mysql');
const fs = require('fs');
const nodemailer = require('nodemailer');
const io = require('socket.io')(http);
const formidable = require('formidable');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const cheerio = require('cheerio');


//server connection
console.log('Connecting to server...');
http.listen(4000, function () {
  console.log('Server is ready');
});
