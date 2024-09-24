import { RoleEnum } from "../enums/role.enum";

export interface IToken {
  _id?: string;
  accessToken: string;
  refreshToken: string;
  _userId: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  name: string;
  role: RoleEnum;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
