var express = require('express');
const indexController = require('../controllers/index');
var router = express.Router();

const { check, body } = require("express-validator");
const User = require("../models/user");


router.get('/', indexController.getFrontPage);

router.get('/login', indexController.getLogin);


router.post('/login',
[
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(stuDoc => {
          if (!stuDoc) {
            return Promise.reject(
              'No user with this email. Do you want to signUp ?'
            );
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
  ],
indexController.postLogin);





router.get('/signup', indexController.getSignup);
router.post('/signup', 
[
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(stuDoc => {
          if (stuDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body('name').isString(),
    body(
      'password',
      'Please enter a password with at least 4 characters.'
    )
      .isLength({ min: 4 }),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
  ],
  indexController.postSignup);


router.post("/logout", indexController.postLogout);


module.exports = router;