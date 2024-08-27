// routes/index.js
const express = require('express');
const router = express.Router();
const registerRouter = require('./auth');
const settingsRouter = require('./settings');
const investRecommand = require('./invest_recommandetions')
const ai_recommend = require('./Ai_recommendations')
const more_investRecommand = require('./filteredInvestment-recommedations')
const companyRouter = require('./companies')
const { verifyToken } = require('../middlewares/verifyToken');
const { User, validateRegister, personalInfoValidate, validateFinancialInfo, validateLoginUser, validateRestPassword} = require('../models/User');
const homeRouter = require('./home')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();



router.use('/', registerRouter);
router.use('/companies', companyRouter);
router.use('/settings', settingsRouter);
router.use('/home', homeRouter);
router.use('/investment-recommedations', investRecommand);
router.use('/ai-recommendations', ai_recommend);
router.use('/filteredInvestment-recommedations', more_investRecommand);
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });
    res.status(200).json({ status: "success", message: "User retrieved successfully.", user:user});
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: 'Server Error......' });
  }
});

router.post('/verifyIdToken', async (req, res) => {
  try {
    const userId = req.body.id;
    
    let token = req.headers['authorization'].split(' ');
  console.log(token);
  if (!token[0]) {
    return res.status(401).json({message: 'token not found'});
  }
    const secret = process.env.SECRET_KEY || 'secret';
    console.log('User ID:', userId);
    console.log('token ID:', token);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "failed" });
    }

    jwt.verify(token[1], secret, (err, tokenUser) => {  
      if (err) {
        return res.status(401).json({ message: "Token not verified" });
      }
      
      return res.status(200).json({ status: "success", message: 'valid'});
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: 'Not valid' });
  }
});


router.get('/', (req, res) => {
  res.send('Hello, World!');
});

module.exports = router;