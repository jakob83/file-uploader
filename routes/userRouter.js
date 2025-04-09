const { Router } = require('express');

const userRouter = new Router();

userRouter.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login?err=You must be logged in to view this page');
  }
  res.redirect(`/${req.user.id}`);
});

userRouter.get('/:userid', (req, res) => {
  const { userid } = req.params;
  if (!req.isAuthenticated()) {
    return res.redirect('/login?err=You must be logged in to view this page');
  }
  if (req.user && req.user.id !== userid) {
    return res.redirect('/login?err=You must be logged in to view this page');
  }
  res.render('home', {
    user: req.user,
  });
});

module.exports = userRouter;
