const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const prisma = require('../prismaClient');

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        done(null, false, { msg: 'No such user' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        done(null, false, { msg: 'Incorrect password' });
      }
      done(null, user);
    } catch (e) {
      done(e);
    }
  })
);

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    done(null, user);
  } catch (e) {
    done(e);
  }
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});
