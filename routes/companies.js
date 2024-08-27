const express = require('express');
const router = express.Router();
const { User, Company, validateCompany} = require('../models/User');
const dotenv = require('dotenv');
const { verifyToken } = require('../middlewares/verifyToken');
dotenv.config();

router.post('/', verifyToken, async (req, res) => {
  const { error } = validateCompany(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });

    user.companies.push(req.body);
    await user.save();

    res.status(201).json({
      status: "success",
      message: "Company added successfully",
      companies: user.companies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Server error' });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, ...updatedData } = req.body;  // Exclude _id from the updated data

    if (!symbol) {
      return res.status(400).json({ status: "error", message: 'Symbol is required' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });

    const companyIndex = user.companies.findIndex(company => company.symbol === symbol);
    if (companyIndex === -1) {
      return res.status(404).json({ status: "error", message: 'Company not found' });
    }

    const updatedCompany = {
      ...user.companies[companyIndex]._doc,
      symbol,
      ...updatedData
    };
    delete updatedCompany._id;

    user.companies[companyIndex] = updatedCompany;
    await user.save();

    // Respond with success
    res.status(200).json({
      status: "success",
      message: "Company updated successfully",
      companies: user.companies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Server error' });
  }
});




router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('companies -_id');
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });

    const DealCompanies = user.companies.filter(company => company.dealDone);
    if (DealCompanies.length === 0) {
      return res.status(404).json({ status: "error", message: 'No deals were found.' });
    }

    res.status(201).json({
      status: "success",
      message: "Company added successfully",
      companies: user.companies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Server error' });
  }
});


module.exports = router;