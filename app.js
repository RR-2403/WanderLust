if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const {MongoStore} = require("connect-mongo");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressError.js");


const listingRouter = require("./routes/listing.js");
const postsRouter = require("./routes/posts.js");
const user = require("./routes/user.js");


const URL = process.env.ATLASDB_URL;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(methodOverride("_method"));


const store = MongoStore.create({
  mongoUrl: URL,

  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

// Session store error handling
store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});


const sessionOptions = {
  store,

  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: true,

  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

app.use(session(sessionOptions));


app.use(flash());


app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;

  next();
});


app.engine("ejs", ejsMate);


async function main() {
  await mongoose.connect(URL);
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

app.use("/listings", listingRouter);


app.use("/listings/:id/reviews", postsRouter);

app.use("/", user);


app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).send(message);
});

if (require.main === module) {
  const port = process.env.PORT || 8080;

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
