const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({
      email,
      username,
    });

    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);

    // Log the user in automatically after signup
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to WanderLust!");

      return res.redirect("/listings");
    });
  } catch (err) {
    console.log(err);

    req.flash("error", err.message);

    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("./users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");

  return res.redirect("/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "You are logged out!");

    return res.redirect("/listings");
  });
};