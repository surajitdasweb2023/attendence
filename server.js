const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const randtoken = require("rand-token");
const passport = require("passport");
const nodemailer = require("nodemailer");

const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const uuid = require("uuid").v4;
require("dotenv").config();
let lastUUID = "";

// DB Operations
const dbooperation = require('./dboperations');

const app = express();
const refreshTokens = {};

const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.PASSPORT_SECRET,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

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

// Setting to user public folder as public folder (default value : index.html)
app.use(express.static('public'));

function mysqlResults(result) {
  return JSON.parse(JSON.stringify(result));
}

// File upload logic if any
const fileNameSeperator = "_";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    lastUUID = uuid();
    cb(null, lastUUID + fileNameSeperator + originalname);
  },
});
const upload = multer({ storage: storage });

function generateAccessToken(user) {
  return jwt.sign({ email: user.email }, process.env.PASSPORT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY_IN_SECS,
  });
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

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
