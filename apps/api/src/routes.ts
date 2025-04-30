import { Hono } from 'hono'
import { authRouter } from './routes/auth.routes'
import { indexRouter } from './routes/index.routes'
import { licensePlateRequestRouter } from './routes/licensePlateRequest.routes'
import { userRouter } from './routes/user.routes'

const router = new Hono()

router.route('/', indexRouter)
router.route('/request', licensePlateRequestRouter)
router.route('/auth', authRouter)
router.route('/user', userRouter)

export default router
