const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const OpenIDConnectStrategy = require("passport-openidconnect").Strategy;
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
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || `${BACKEND_URL}/api/auth/linkedin/callback`,
      scope: ["openid", "profile", "email"]
    },
    async (issuer, profile, done) => {
      console.log("[LinkedIn OAuth] 3. Passport verify callback reached.");
      console.log("[LinkedIn OAuth] Issuer:", issuer);
      console.log("[LinkedIn OAuth] Raw Profile from LinkedIn:", JSON.stringify(profile, null, 2));

      try {
        // Handle variations in profile format:
        // passport-openidconnect usually provides standardized fields (emails, displayName, photos)
        // but raw JSON is available in profile._json
        const jsonProfile = profile._json || profile;
        
        const email = profile.emails?.[0]?.value || jsonProfile.email;
        
        // Build name carefully considering possible missing fields
        let name = profile.displayName || jsonProfile.name;
        if (!name && (jsonProfile.given_name || jsonProfile.family_name)) {
          name = `${jsonProfile.given_name || ''} ${jsonProfile.family_name || ''}`.trim();
        }

        const providerId = profile.id || jsonProfile.sub;
        const picture = profile.photos?.[0]?.value || jsonProfile.picture;

        console.log("[LinkedIn OAuth] Extracted Data:", { email, name, providerId, picture });

        if (!email) {
          console.warn("[LinkedIn OAuth] Email is undefined. Cannot proceed without email.");
          return done(new Error("LinkedIn email is missing or undefined"), null);
        }

        console.log("[LinkedIn OAuth] 6. Database lookup for user with email:", email);
        let user = await User.findOne({ email: email });

        if (!user) {
          console.log("[LinkedIn OAuth] 7a. User not found. Creating new user.");
          user = new User({
            name: name || "LinkedIn User",
            email: email,
            providerId: providerId,
            provider: "linkedin",
            profileImage: picture
          });
          await user.save();
          console.log("[LinkedIn OAuth] New user created successfully:", user._id);
        } else {
          console.log("[LinkedIn OAuth] 7b. User found. Syncing profile details.");
          // Sync profile details
          user.name = name || user.name;
          user.profileImage = picture || user.profileImage;
          if (!user.providerId || user.provider === "local") {
            user.providerId = providerId;
            user.provider = "linkedin";
          }
          await user.save();
          console.log("[LinkedIn OAuth] User updated successfully:", user._id);
        }
        
        console.log("[LinkedIn OAuth] Verify callback successful. Returning user.");
        return done(null, user);
      } catch (error) {
        console.error("[LinkedIn OAuth] Error during verify callback:", error);
        if (error.stack) console.error(error.stack);
        return done(error, null);
      }
    }
  )
);
module.exports = passport;