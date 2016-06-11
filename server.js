'use strict';

const express = require('express'), 
      mysql = require('mysql'), 
      bodyParser = require('body-parser'),
      dbConfig = 
      require('./database.json'), 
      crypto = require('crypto'),
      config = require('./config.json'),
      nodemailer = require('nodemailer');

var mailTransporter = nodemailer.createTransport(config.smtpAddr);

const PORT = 8080;

// App
const app = express();

var db = mysql.createConnection(dbConfig.dev);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    return next();
});

function md5(string){
    return crypto.createHash('md5').update(string).digest("hex")
}

function timestamp(){
    return new Date().getTime();
}

app.post('/admin-login', function (req, res) {
    try{
        var username = req.body.username, password = req.body.password;

        db.query('SELECT * FROM admins WHERE `username` = ? AND `password` = ?', [username, password], function(error, results, fields){
            if(error || results.length < 1){
                return endResponseWithError(res, "Invalid credentials");
            }

            res.end(JSON.stringify({'status': 'ok', 'username': results[0].username, 'hash': md5(results[0].password)}));
        });
    }catch(e){
        endResponseWithError(res, 'Unknown error');
    }
});

app.post('/user-login', function (req, res) {
    try{
        var email = req.body.email, password = req.body.password;

        db.query('SELECT * FROM users WHERE `email` = ? AND `password` = ?', [email, md5(password)], function(error, results, fields){
            if(error || results.length < 1){
                return endResponseWithError(res, "Invalid credentials");
            }

            res.end(JSON.stringify({'status': 'ok', 'email': results[0].email, 'password': results[0].password, 'name': results[0].name}));
        });
    }catch(e){
        endResponseWithError(res, 'Unknown error');
    }
});

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

app.post('/upload-images-for-property', upload.array('file'), function (req, res) {
    var result = [];

    for (var i = 0; i < req.files.length; i++) {
        result.push({name: req.files[i].filename, original: req.files[i].originalname});
    };

    res.end(JSON.stringify({'files': result}));
});

/* Property for user actions */

function withUserByEmailAndPasswordHash(email, passwordHash, callback){
    db.query('SELECT * FROM users WHERE `email` = ? AND `password` = ?', [email, passwordHash], function(error, results, fields){
        if(error || results.length < 1){
            return callback(null);
        }

        callback(results[0]);
    });
}


function endResponseWithError(response, err){
    console.log('Error response', err);
    return response.end(JSON.stringify({'error':err}));
}

function successResponse(response){
    console.log('Success response');
    response.end('{"status": "ok"}');
}

function validateFieldExistence(req, res, field, message, callback){
    var fieldValue = req.body[field];

    if(!fieldValue){
        return endResponseWithError(res, message);
    }

    callback();
}

global.withUserByEmailAndPasswordHash = withUserByEmailAndPasswordHash;
global.mailTransporter = mailTransporter;
global.config = config;
global.timestamp = timestamp;
global.validateFieldExistence = validateFieldExistence;
global.md5 = md5;
global.app = app;
global.db = db;
global.successResponse = successResponse;
global.endResponseWithError = endResponseWithError;

require('./user-activation.js');
require('./user-registration.js');
require('./user-property.js');
require('./admin-property.js');

app.use(express.static('public'));
app.use('/property-images', express.static('property-images'));

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

