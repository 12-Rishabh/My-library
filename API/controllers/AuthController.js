const User = require("./../models/User");
const bcyrpt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @description - Adds a new user to the database
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user detail
 *
 * Route: POST: /users/signup
 */

exports.signup = async (req, res, next) => {
  try {
    const salt = await bcyrpt.genSalt(10);
    const hashedPass = await bcyrpt.hash(req.body.password, salt);

    const temp = req.body.isAdmin ? true : false;

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
      isAdmin: temp,
    });

    const user = await newUser.save();
    res.status(201).json({
      message: "Signup Successfull.",
    });
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - Authenticates user login information
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Object containing user details
 *
 * Route: POST: /users/login
 */

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.status(404).json("User not found!");
    else {
      const validPass = await bcyrpt.compare(req.body.password, user.password);
      if (!validPass) res.status(400).json("Wrong password!");
      else {
        // generate Token
        const accessToken = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.SECRET_KEY
        );
        res.status(200).json({
          message: "Login successfull",
          accessToken,
        });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};
