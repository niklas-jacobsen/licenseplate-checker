import app from './app'
import { ENV } from './env'

export default {
  port: ENV.PORT || 8080,
  fetch: app.fetch,
}
