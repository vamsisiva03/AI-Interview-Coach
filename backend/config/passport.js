const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const OpenIDConnectStrategy = require("passport-openidconnect").Strategy;
const User = require("../models/User");
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/* ================= SERIALIZE ================= */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


/* ================= GOOGLE LOGIN ================= */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          // Sync profile details from Google
          user.name = profile.displayName || user.name;
          user.profileImage = profile.photos?.[0]?.value || user.profileImage;
          
          if (!user.providerId) {
            user.providerId = profile.id;
            user.provider = "google";
          }
          await user.save();
          return done(null, user);
        }

        // Create new user if not found
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          providerId: profile.id,
          provider: "google",
          profileImage: profile.photos?.[0]?.value
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);



/* ================= GITHUB LOGIN ================= */

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = new User({
            name: profile.username,
            email: profile.emails?.[0]?.value || `${profile.id}@github.com`,
            providerId: profile.id,
            provider: "github",
            profileImage: profile.photos?.[0]?.value
          });
          await user.save();
        } else {
          // Sync profile details
          user.name = profile.username || user.name;
          user.profileImage = profile.photos?.[0]?.value || user.profileImage;
          if (!user.providerId) {
            user.providerId = profile.id;
            user.provider = "github";
          }
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);



/* ================= LINKEDIN LOGIN ================= */


passport.use(
  "linkedin",
  new OpenIDConnectStrategy(
    {
      issuer: "https://www.linkedin.com",
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
      userInfoURL: "https://api.linkedin.com/v2/userinfo",
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/linkedin/callback`,
      scope: ["openid", "profile", "email"]
    },
    async (issuer, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = new User({
            name: profile.name,
            email: profile.email,
            providerId: profile.sub,
            provider: "linkedin",
            profileImage: profile.picture
          });
          await user.save();
        } else {
          // Sync profile details
          user.name = profile.name || user.name;
          user.profileImage = profile.picture || user.profileImage;
          if (!user.providerId) {
            user.providerId = profile.sub;
            user.provider = "linkedin";
          }
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
module.exports = passport;