const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const randtoken = require("rand-token");
const passport = require("passport");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const uuid = require("uuid").v4;
require("dotenv").config();
let lastUUID = "";

const app = express();
const refreshTokens = {};

const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
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

app.use(express.static('public'));

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

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_ATLAS_CONNECTION_STRING, {});

// Mongo DB model User
const User = mongoose.model("User", {
  email: String,
  password: String,
  userType: String,
  passwordReset: Boolean,
  isPasswordCreated: Boolean,
  creationDateTime: Date,
  lastUpdatedDateTime: Date,
  isUserActive: Boolean,
  otherField1: String,
  otherField2: String,
});

function generateAccessToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRY_IN_SECS,
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

// Middleware to verify JWT
// const verifyToken = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).send('Access denied. No token provided.');

//   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//     if (err) return res.status(401).send('Invalid token.');
//     req.user = decoded;
//     next();
//   });
// };

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

// Test api
app.get("/test", (req, res) => {
  res.status(200).json({ success: "Tesing" });
});

app.get('/send', async (req, res) => {
  const email = "sura.234212@gmail.com";
  const subject = "Testing Email service";
  const message = `<h1>Testing</h1>`;
  const output = await sendMail(email, subject, message);
  if (output.response) {
    if (output.response.split(" ")[2] === 'OK') {
      res.status(200).json({message: 'Mail has been sent successfully'});
    } else {
      res.status(200).json({message: 'Sending mail has been failed'});
    }
  }
})

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      userType: "normal",
      passwordReset: false,
      isPasswordCreated: false,
      creationDateTime: new Date(),
      lastUpdatedDateTime: new Date(),
      isUserActive: true,
      otherField1: null,
      otherField2: null,
    });

    await user.save();
    res.status(201).send("User registered successfully.");
  } catch (error) {
    res.status(500).send("Error registering user.");
  }
});

// Protected route example
app.get("/protected", authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.username}!`);
});

// Login and get JWT and refresh token
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.find({});
    console.log(user);
    if (!user)
      return res.status(401).json({ message: "Invalid username or password." });

    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) return res.status(401).send('Invalid username or password.');

    const token = generateAccessToken(user);
    const refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = username;
    res.status(200).json({ jwt: token, refreshToken: refreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/refresh", function (req, res) {
  const refreshToken = req.body.refreshToken;

  if (refreshToken in refreshTokens) {
    const user = {
      username: refreshTokens[refreshToken],
      role: "admin",
    };
    const token = generateAccessToken(user);
    res.json({ jwt: token });
  } else {
    res.sendStatus(401);
  }
});

app.post("/logout", function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken];
  }
  res.sendStatus(204);
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
