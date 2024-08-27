// routes/register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const { User, validateRegister, personalInfoValidate, validateFinancialInfo, validateLoginUser, validateRestPassword} = require('../models/User');
const dotenv = require('dotenv');
const { verifyToken } = require('../middlewares/verifyToken');
dotenv.config();


router.get('/verifyToken', async (req, res) => {
  try {
    let token = req.headers['authorization'].split(' ');
  console.log(token);
  if (!token[0]) {
    return res.status(401).json({message: 'token not found'});
  }

  
    console.log(token[1]);
    const tokenUser = jwt.verify(token[1], process.env.SECRET_KEY || "secret");
    return res.status(200).json({ message: 'Token is valid', user: tokenUser });
  } catch(err) {
    return res.status(401).json({message: 'Unauthorized'});
  }
});

/**
 * @des Register new user
 * @route /register
 * @method POST
 * @access public
 */
router.post('/register', async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });

  try {
    // Check if email is registered before
    const email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).json({ status: "error", message: "This email is already registered" });

    // Make hashed password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const newUser = new User(req.body);
    await newUser.save();

    // Generate Token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.SECRET_KEY || "secret", { expiresIn: "1d" });
    res.cookie('token', token, { httpOnly: true, secure: true });

    // send confirmation mail
    const protocol = req.protocol;
    const host = req.headers.host;
    const link = `${protocol}://${host}/register/personal-info`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.APPPASSWORD
      }
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: newUser.email,
      subject: 'Confirmation mail',
      html: `<div>
            <h3>Click below to rest your password</h3>
            <p>${link}</p>
          </div>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err)
      }
    });


    res.status(201).json({ status: "success", message: "User registered successfully", user: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: 'Server Error......' });
  }
});

/**
 * @des Take info from user
 * @route /register/personal-info
 * @method POST
 * @access public
 */
router.post('/register/personal-info', verifyToken, async (req, res) => {
  const { error } = personalInfoValidate(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });

  try {
    const userId = req.user.id;
    const birthdayString = `${req.body.year}-${req.body.month}-${req.body.day}`;
    const userUpdate = await User.findByIdAndUpdate(userId, {
      fullName: req.body.fullName,
      gender: req.body.gender,
      country: req.body.country,
      birthday: new Date(birthdayString)
    }, { new: true });
    res.status(201).json({ status: "success", message: "Personal information updated successfully", user: userUpdate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: 'Server Error......' });
  }
});

/**
 * @des Take Financial information
 * @route /register/personal-info/financial-info
 * @method POST
 * @access public
 */
router.post('/register/personal-info/financial-info', verifyToken, async (req, res) => {
  const { error } = validateFinancialInfo(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });

  try {
    const userId = req.user.id;
    const userUpdate = await User.findByIdAndUpdate(userId, {
      salary: req.body.salary,
      saving: req.body.saving,
      expenses: req.body.expenses,
      investments: req.body.investments,
      debtsToPay: req.body.debtsToPay,
      debtsOwed: req.body.debtsOwed,
    }, { new: true });
    res.status(200).json({ status: "success", message: "Financial information updated successfully", user: userUpdate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server Error..." });
  }
});

/**
 * @des Login user
 * @route /login
 * @method POST
 * @access public
 */
router.post('/login', async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });

  try {
    // Check if username is registered before
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json({ status: "error", message: "Invalid username or password" });

    // Check if password is correct
    const isPassCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPassCorrect) return res.status(401).json({ status: "error", message: "Invalid username or password" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY || "secret", { expiresIn: "1d" });
    const { password, ...other } = user._doc;
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ status: "success", message: "Login successful", user: other, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: 'Server Error......' });
  }
});

/**
 * @des sent rest-password link
 * @route /forget-password
 * @method POST
 * @access public
 */
router.post('/forget-password', async(req, res) => {
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(404).json({message: "failed"});
  }

  // create a secrete key for just rest password expired if password changes or after 10 min from sending the link
  const secretKey = process.env.SECRET_KEY || 'secret';
  const token = await jwt.sign({email: user.email, id: user._id}, secretKey, { expiresIn: "10m" });

  // create a rest link
  const protocol = req.protocol;
  const host = req.headers.host;
  const link = `${protocol}://${host}/forget-password/${user._id}/${token}`;

  res.status(200).json({message: "rest your password", link});

  // send link to email user
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.APPPASSWORD
    }
  });
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: user.email,
    subject: 'Rest Password',
    html: `<div>
            <h3>Click below to rest your password</h3>
            <p>${link}</p>
          </div>`
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err)
    }
  });

})

/**
 * @des rest password
 * @route /forget-password/:userId/:token
 * @method POST
 * @access public
 */
router.post('/forget-password/:userId/:token', async(req, res) => {
  const { error } = validateRestPassword(req.body);
  if (error) return res.status(400).json({message: error.details[0].message});

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({message: "failed"});

  const secret = process.env.SECRET_KEY + user.password;
  try {
    jwt.verify(req.params.token, secret, (err, user) => {
      if (err){
        return res.status(401).json({message: "Token not verified"});
      }
    });

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    user.password = req.body.password;

    await user.save();

    res.status(200).json({ status: "success", message: "password is rest" });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Error..."});
  }
})

module.exports = router;
