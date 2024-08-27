const mongoose = require('mongoose');
const Joi = require('joi');
const joiPasswordComplexity = require('joi-password-complexity');


const companySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  marketCap: {
    type: Number,
    default: 0
  },
  sector: {
    type: String,
    trim: true,
    default: null
  },
  industry: {
    type: String,
    trim: true,
    default: null
  },
  beta: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    default: 0
  },
  lastAnnualDividend: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  exchange: {
    type: String,
    trim: true,
    default: null
  },
  exchangeShortName: {
    type: String,
    trim: true,
    default: null
  },
  country: {
    type: String,
    trim: true,
    default: null
  },
  isEtf: {
    type: Boolean,
    default: false
  },
  isFund: {
    type: Boolean,
    default: false
  },
  isActivelyTrading: {
    type: Boolean,
    default: true
  },
  dealDone: {
    type: Boolean,
    default: false
  },
  star: {
    type: Boolean,
    default: false 
  },
  moneySpent: {
    type: Number,
    default: 0 
  }
});
// user schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    unique: true
  },  email: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  fullName: {
    type: String,
    minlength: 8,
    trim: true,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null 
  },
  birthday: {
    type: Date,
    default: null
  },
  country: {
    type: String,
    trim: true,
    default: null,
  },
  profileImage: {
    type: String,
    default: 'avatar.png'
  },
  salary: {
    type: Number,
    default: 0
  },
  saving: {
    type: Number,
    default: 0
  },
  expenses: {
    type: Number,
    default: 0
  },
  investments: {
    type: Number,
    default: 0
  },
  debtsToPay: {
    type: Number,
    default: 0
  },
  debtsOwed: {
    type: Number,
    default: 0
  },
  companies: [companySchema]
}, {timestamps: true});

const validateCompany = (company) => {
  const schema = Joi.object({
    symbol: Joi.string().required(),
    companyName: Joi.string().required(),
    marketCap: Joi.number().min(0).required(),
    sector: Joi.string().allow(null, ''),
    industry: Joi.string().allow(null, ''),
    beta: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    lastAnnualDividend: Joi.number().min(0).required(),
    volume: Joi.number().min(0).required(),
    exchange: Joi.string().required(),
    exchangeShortName: Joi.string().required(),
    country: Joi.string().allow(null, ''),
    isEtf: Joi.boolean().required(),
    isFund: Joi.boolean().required(),
    isActivelyTrading: Joi.boolean().required(),
    dealDone: Joi.boolean().required(),
    star: Joi.boolean().required(),
    moneySpent: Joi.number().min(0)
  });
  return schema.validate(company);
};


// validate Register
const validateRegister = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).trim().required(),
    email: Joi.string().email().required(),
    password: joiPasswordComplexity().required()
  });

  return schema.validate(user);
};

//validate personal info
const personalInfoValidate = (person) => {
  const schema = Joi.object({
    _id: Joi.string(),
    fullName: Joi.string().min(1).trim().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    country: Joi.string().required(),
    day: Joi.number().integer().min(1).max(31).required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  });

  return schema.validate(person);
}

const validateFinancialInfo = (info) => {
  const schema = Joi.object({
    _id: Joi.string(),
    salary: Joi.number().min(0).required(),
    saving: Joi.number().min(0).required(),
    expenses: Joi.number().min(0).required(),
    investments: Joi.number().min(0).required(),
    debtsToPay: Joi.number().min(0).required(),
    debtsOwed: Joi.number().min(0).required(),
  });

  return schema.validate(info);
}

const validateLoginUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  return schema.validate(user);
}

const validateUpdate = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).trim(),
    email: Joi.string().email(),
    password: joiPasswordComplexity(),
    fullName: Joi.string().min(1).trim(),
    gender: Joi.string().valid('male', 'female', 'other'),
    country: Joi.string(),
    day: Joi.number().integer().min(1).max(31),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    salary: Joi.number().min(0),
    saving: Joi.number().min(0),
    expenses: Joi.number().min(0),
    investments: Joi.number().min(0),
    debtsToPay: Joi.number().min(0),
    debtsOwed: Joi.number().min(0)
  });

  return schema.validate(user);
}

//validate rest password
const validateRestPassword = (password) => {
  const schema = Joi.object({
    password: joiPasswordComplexity().required(),
  });
  return schema.validate(password);
}

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);

module.exports = {
  User,
  validateRegister,
  personalInfoValidate,
  validateFinancialInfo,
  validateLoginUser,
  validateUpdate,
  validateCompany,
  validateRestPassword,
  Company
};