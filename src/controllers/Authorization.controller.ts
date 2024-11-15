import { verify, sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ENV } from '../env';

class AuthController {
  async hashPassword(plainPassword: string, saltRounds: number = 10) {
    return bcrypt.hash(plainPassword, saltRounds);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateJWT(userId: string, secret: string = ENV.JWT_SECRET) {
    const token = sign({ sub: userId }, secret, {
      expiresIn: '30 minutes',
    });
    return token;
  }

  async verifyJWT(token: string, secret: string = ENV.JWT_SECRET) {
    const payload = verify(token, secret);
    return payload.sub;
  }
}

export default AuthController;
