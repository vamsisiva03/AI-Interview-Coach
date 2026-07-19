const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const OAuth2Strategy = require("passport-oauth2").Strategy;
const axios = require("axios");
const User = require("../models/User");
const BACKEND_URL = process.env.BACKEND_URL;

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
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/api/auth/google/callback`
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

if (!process.env.GITHUB_CALLBACK_URL) {
  console.warn("WARNING: GITHUB_CALLBACK_URL environment variable is missing.");
}

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.id}@github.com`;

        // 1. Search for an existing user by GitHub ID first.
        let user = await User.findOne({ providerId: profile.id, provider: "github" });

        if (!user) {
          // 2. If not found, search by email.
          user = await User.findOne({ email: email });

          if (user) {
            // 3. If the email already exists: Link githubId to the existing account if missing.
            user.name = profile.username || user.name;
            user.profileImage = profile.photos?.[0]?.value || user.profileImage;
            
            if (!user.providerId || user.provider === "local") {
              user.providerId = profile.id;
              user.provider = "github";
            }
            await user.save();
          } else {
            // 4. Only create a new user when neither GitHub ID nor email exists.
            user = new User({
              name: profile.username || "GitHub User",
              email: email,
              providerId: profile.id,
              provider: "github",
              profileImage: profile.photos?.[0]?.value
            });
            await user.save();
          }
        } else {
          // If found by GitHub ID, sync profile details
          user.name = profile.username || user.name;
          user.profileImage = profile.photos?.[0]?.value || user.profileImage;
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


const linkedInStrategy = new OAuth2Strategy(
  {
    authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
    tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || `${BACKEND_URL}/api/auth/linkedin/callback`,
    scope: ["openid", "profile", "email"],
    state: true // Recommended by OAuth2/LinkedIn, works with express-session
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.email;
      const name = profile.name;
      const providerId = profile.providerId;
      const picture = profile.picture;

      if (!email) {
        console.warn("[LinkedIn OAuth] Email is undefined from userinfo endpoint.");
        return done(null, false, { message: "LinkedIn email is missing or undefined" });
      }

      let user = await User.findOne({ email: email });

      if (!user) {
        user = new User({
          name: name,
          email: email,
          providerId: providerId,
          provider: "linkedin",
          profileImage: picture
        });
        await user.save();
      } else {
        // Sync profile details
        user.name = name || user.name;
        user.profileImage = picture || user.profileImage;
        if (!user.providerId || user.provider === "local") {
          user.providerId = providerId;
          user.provider = "linkedin";
        }
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      console.error("[LinkedIn OAuth2] Verify callback error:", error);
      return done(error);
    }
  }
);

// Override userProfile to fetch and normalize the profile exactly how we want it
linkedInStrategy.userProfile = async function(accessToken, done) {
  try {
    const { data } = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const profile = {
      provider: 'linkedin',
      _raw: JSON.stringify(data),
      _json: data,
      email: data.email || data.emailAddress,
      name: data.name,
      providerId: data.sub || data.id,
      picture: data.picture || null
    };

    if (!profile.name && (data.given_name || data.family_name)) {
      profile.name = `${data.given_name || ''} ${data.family_name || ''}`.trim();
    }
    if (!profile.name) profile.name = "LinkedIn User";

    return done(null, profile);
  } catch (error) {
    console.error("[LinkedIn OAuth2] Failed to fetch user profile", error);
    return done(error);
  }
};

passport.use("linkedin", linkedInStrategy);
module.exports = passport;