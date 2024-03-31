const Auth = require("../models/auth");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  console.log(req.body);
  const user = await Auth.create({ ...req.body });
  const john = { name: user.name };
  token = jwt.sign(john, "i lwanna have intercourse with you yh yh yh");
  console.log(user);
  console.log(token);
  res.send(user);
};

const login = async (req, res) => {
  const { name, email, password } = req.body;
  const userExist = await Auth.find({ name, email });
  console.log(userExist);
  if (userExist) {
    const userName = name;
    token = jwt.sign(name, "i lwanna have intercourse with you yh yh yh");
    res.send(token);
  }
};

const authentication = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.status(401).send("you do not have access to this page");
  }
  jwt.verify(
    token,
    "i lwanna have intercourse with you yh yh yh",
    (err, data) => {
      if (err) {
        console.log("wrong");
      } else {
        req.userExist = data;
        next();
      }
    }
  );
};

module.exports = {
  register,
  login,
  authentication,
};
