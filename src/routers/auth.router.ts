import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.post(
  "/sign-up",
  commonMiddleware.isBodyValid(UserValidator.create),
  authController.signUp,
);
router.post("/sign-in", authController.signIn);

router.post(
  "/refresh",
  authMiddleware.checkRefreshToken,
  authController.refresh,
);

router.post(
  "/logout",
  authMiddleware.checkAccessToken,
  authController.logoutFromCurrentDevice,
);

router.post(
  "/logout-all",
  authMiddleware.checkAccessToken,
  authController.logoutFromAllDevices,
);

export const authRouter = router;
