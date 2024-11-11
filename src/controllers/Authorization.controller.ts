import { Secret, verify, sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { SECRET_KEY } from '../middleware/auth';

export const zodSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

class AuthController {
  async hashPassword(plainPassword: string, saltRounds: number = 10) {
    return bcrypt.hash(plainPassword, saltRounds);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateJWT(userId: string) {
    const token = sign(
      {
        sub: userId,
      },
      SECRET_KEY,
      { expiresIn: '30 minutes' }
    );
    return token;
  }

  async verifyJWT(token: string) {
    try {
      const payload = verify(token, SECRET_KEY);
      return payload.sub;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export default AuthController;
