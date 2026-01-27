import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

const SECRET = "secretJWT";

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Credenciales incorrectas",
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, "secretJWT", {
      expiresIn: "1h",
    });

    res.json({
      message: "Login exitoso",
      token,
    });
  })(req, res, next);
});

// Current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      user: {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart,
      },
    });
  },
);

export default router;