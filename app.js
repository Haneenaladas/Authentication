//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });//this will encrypt all our database and we don't want to encrypt emails, only the pass, so we add the encryptedFields: ['age']

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  try {
    await newUser.save();
    res.render("secrets"); // Redirect to home page or another page after registration
  } catch (e) {
    console.log(e);
  }
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  (async () => {
    try {
      const foundUser = await User.findOne({email:username});
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    } catch (e) {
      console.log(e);
    }
  })();
});



app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
