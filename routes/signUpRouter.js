const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const signUpRouter = new Router();

signUpRouter.get('/', (req, res) => {
  res.render('register');
});

signUpRouter.post(
  '/',
  body('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Username must be specified'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').not().isEmpty().withMessage('password must be specified'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped());
      return res.render('register', {
        errors: errors.mapped(),
        oldData: req.body,
      });
    }
    const { username, password, email } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
      await prisma.user.create({
        data: {
          username,
          password: hash,
          email,
        },
      });
    } catch (error) {
      if (error.code == 'P2002') {
        return res.render('register', {
          email: 'Email already exists',
          oldData: req.body,
        });
      } else {
        return res.render('register', {
          error: 'An error occurred',
          oldData: req.body,
        });
      }
    }

    res.redirect('/login');
  }
);
module.exports = signUpRouter;
