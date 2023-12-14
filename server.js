require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const randtoken = require("rand-token");
const uuid = require("uuid").v4;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

const refreshTokens = {};
let lastUUID = "";


// CORS ORIGIN CONFIGURATIONS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGINS);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Accept-Encoding, Accept-Language, Authorization, Content-Length, X-Requested-With"
  );

  // allow preflight
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});



// PASSPORT CONFIGURATIONS
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.PASSPORT_SECRET,
};
passport.use(
  new JwtStrategy(passportOpts, function (jwtPayload, done) {
    const expirationDate = new Date(jwtPayload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    done(null, jwtPayload);
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.username);
});



// DB Operations
const dbooperation = require('./dboperations');


// Setting to user public folder as public folder (default value : index.html)
app.use(express.static('public'));



// UTILITY FUNCTIONS
function mysqlResults(result) {
  return JSON.parse(JSON.stringify(result));
}
function generateAccessToken(user) {
  return jwt.sign({ email: user.email }, process.env.PASSPORT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY_IN_SECS,
  });
}
function authenticateTokenForAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.PASSPORT_SECRET, (err, user) => {
    if (user.userType !== 'admin') return res.sendStatus(401);
    if (err) return res.sendStatus(403)

    req.user = user;
    next();
  })
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.PASSPORT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}
async function sendMail(email, subject, htmlTemplate) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: htmlTemplate
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    return error;
  }
}
function generateRandomPassword(length) {
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var password = "";

  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}



// UPLOADING FILES INTO THE SYSTEM
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    lastUUID = uuid();
    cb(null, lastUUID + "_" + originalname);
  },
});
const upload = multer({ storage: storage });


// APIs to invoke from Web Application
app.get('/getAllUsers', (req, res) => {
  dbooperation.getAllUsers().then(result => {
    const data = mysqlResults(result);
    if (data.length > 0) {
      const output = [];
      for (let index = 0; index < data.length; index++) {
        output.push(
          {
            id: data[index].id,
            email: data[index].email,
            userType: data[index].userType,
            passwordReset: data[index].passwordReset,
            isPasswordCreated: data[index].isPasswordCreated,
            creationDateTime: data[index].creationDateTime,
            lastUpdatedDateTime: data[index].lastUpdatedDateTime,
            isUserActive: data[index].isUserActive,
            otherField1: data[index].otherField1,
            otherField2: data[index].otherField2
          }
        )
      }
      return res.json({ status: 'OK', result: output });
    } else {
      return res.json({ status: 'OK', result: [] });
    }
  }).catch(err => {
    return res.json({ status: 'ERROR', result: err });
  })
});


// SERVER START WITH PORT
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
