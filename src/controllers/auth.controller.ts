import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api-error";
import { ITokenPayload } from "../interfaces/token.interface";
import { ISignIn, IUser } from "../interfaces/user.interface";
import { authService } from "../services/auth.service";

class AuthController {
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IUser;
      const result = await authService.signUp(dto);

      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as ISignIn;
      const result = await authService.signIn(dto);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.res.locals.refreshToken as string;
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const result = await authService.refresh(token, jwtPayload);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async logoutFromCurrentDevice(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const jwtPayload = req.res.locals.jwtPayload;
      const accessToken = req.headers.authorization?.split("Bearer ")[1];

      if (!accessToken) {
        throw new ApiError("Access token is not provided", 401);
      }

      await authService.logoutFromCurrentDevice(jwtPayload, accessToken);

      res.status(200).json({ message: "Logged out from current device" });
    } catch (e) {
      next(e);
    }
  }

  public async logoutFromAllDevices(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const jwtPayload = req.res.locals.jwtPayload;

      if (!jwtPayload) {
        throw new ApiError("User ID is not provided", 401);
      }

      await authService.logoutFromAllDevices(jwtPayload);

      res.status(200).json({ message: "Logged out from all devices" });
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
