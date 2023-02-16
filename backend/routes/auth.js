const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "Shrutiisgood";
const fetchuser=require("../middleware/fetchuser");


//ROUTE : 1 ----create a user using : POST "/api/auth/createuser". Doesn't require Authentication
router.post(
  "/createuser",
  [
    // validations
    body("email", "Enter a valid name").isEmail(),
    body("name", "Enter a valid email").isLength({ min: 3 }),
    body("password", "Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //if there are errors , return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    //Check whether the user with this email already exists
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      console.log(authtoken);
      res.json({ success , authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured...");
    }
  }
);

///ROUTE : 2 ----- Authenticate a user using : POST " /api/auth/login" . no login required
router.post(
  "/login",
  [
    // validations
    body("email", "Enter a valid name").isEmail(),

    body("password", "password cannot be empty").exists(),
  ],
  async (req, res) => {
    let success=false;
    //if there are errors , return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "please try to login with correct credentials" });
         
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured...");
    }
  }
);
/// ROUTE 3: Get loggid in user details using  :POST "/api/auth/getuser" . loging required
router.post("/getuser",fetchuser,async (req, res) => {

    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured...");
    }
  }
);
module.exports = router;
