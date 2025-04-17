const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const prisma = require('../prismaClient');

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' }, // Because the default fields are username and password
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
          include: { rootDir: true },
        });
        if (!user) {
          return done(null, false, {
            message: 'No user found with this email',
          });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Password is incorrect' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    return done(null, user);
  } catch (e) {
    done(e);
  }
});

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
