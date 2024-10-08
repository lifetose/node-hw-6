import { EmailTypeEnum } from "../enums/email-type.enum";
import { ApiError } from "../errors/api-error";
import { ITokenPair, ITokenPayload } from "../interfaces/token.interface";
import { ISignIn, IUser } from "../interfaces/user.interface";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  public async signUp(
    dto: Partial<IUser>,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    await this.isEmailExistOrThrow(dto.email);
    const password = await passwordService.hashPassword(dto.password);
    const user = await userRepository.create({ ...dto, password });

    const tokens = tokenService.generateTokens({
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await tokenRepository.create({ ...tokens, _userId: user._id });

    await emailService.sendMail(EmailTypeEnum.WELCOME, user.email, {
      name: user.name,
    });
    return { user, tokens };
  }

  public async signIn(
    dto: ISignIn,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await userRepository.getByEmail(dto.email);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const isPasswordCorrect = await passwordService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new ApiError("Invalid credentials", 401);
    }

    const tokens = tokenService.generateTokens({
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await tokenRepository.create({ ...tokens, _userId: user._id });
    return { user, tokens };
  }

  public async refresh(
    refreshToken: string,
    payload: ITokenPayload,
  ): Promise<ITokenPair> {
    await tokenRepository.deleteByParams({ refreshToken });
    const tokens = tokenService.generateTokens({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });
    await tokenRepository.create({ ...tokens, _userId: payload.userId });
    return tokens;
  }

  private async isEmailExistOrThrow(email: string): Promise<void> {
    const user = await userRepository.getByEmail(email);
    if (user) {
      throw new ApiError("Email already exists", 409);
    }
  }

  public async logoutFromCurrentDevice(
    jwtPayload: ITokenPayload,
    accessToken: string,
  ): Promise<void> {
    await tokenRepository.deleteByParams({ accessToken });
    await emailService.sendMail(EmailTypeEnum.LOGOUT, jwtPayload.email, {
      name: jwtPayload.name,
    });
  }

  public async logoutFromAllDevices(jwtPayload: ITokenPayload): Promise<void> {
    await tokenRepository.deleteByParamsAll({ _userId: jwtPayload.userId });
    await emailService.sendMail(EmailTypeEnum.LOGOUT, jwtPayload.email, {
      name: jwtPayload.name,
    });
  }
}

export const authService = new AuthService();
