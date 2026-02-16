import * as bcrypt from 'bcrypt'
import { JwtPayload, sign, verify } from 'jsonwebtoken'
import { ENV } from '../env'
import { InvalidTokenError } from '../types/auth.types'

class AuthController {
  async hashPassword(plainPassword: string, saltRounds: number = 10) {
    return bcrypt.hash(plainPassword, saltRounds)
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  async generateJWT(userId: string, secret: string = ENV.JWT_SECRET) {
    const token = sign({ id: userId }, secret, {
      expiresIn: '30 days',
    })
    return token
  }

  async verifyJWT(
    token: string,
    secret: string = ENV.JWT_SECRET
  ): Promise<{ id: string }> {
    const payload = verify(token, secret) as JwtPayload

    if (typeof payload === 'object' && typeof payload.id === 'string') {
      return { id: payload.id }
    }

    throw new InvalidTokenError()
  }
}

export default AuthController
