import moment from "moment";

import { env } from "../../../../config/config";
import { tokenTypes } from "../../../../config/tokens";
import { User } from "../../repositories/models/user.model";
import { TokenRepository } from "../../repositories/ports/token.repository";
import { GenerateTokenUseCase } from "./generateToken";

const generateTokenUseCase = new GenerateTokenUseCase();

export class GenerateAuthTokensUseCase {
  constructor(private tokenRepository: TokenRepository) {}

  async execute(user: User) {
    const accessTokenExpires = moment().add(
      env.JWT_ACCESS_EXPIRATION_MINUTES,
      "minutes"
    );
    const accessToken = await generateTokenUseCase.execute(
      user.id,
      accessTokenExpires,
      tokenTypes.ACCESS
    );

    const refreshTokenExpires = moment().add(
      env.JWT_REFRESH_EXPIRATION_DAYS,
      "days"
    );
    const refreshToken = await generateTokenUseCase.execute(
      user.id,
      refreshTokenExpires,
      tokenTypes.REFRESH
    );

    await this.tokenRepository.create({
      token: refreshToken,
      userId: user.id,
      type: tokenTypes.REFRESH,
      expires: refreshTokenExpires.toDate(),
      blacklisted: false,
    });

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }
}
