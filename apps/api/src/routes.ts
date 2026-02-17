import { Hono } from 'hono'
import { authRouter } from './routes/auth.routes'
import { indexRouter } from './routes/index.routes'
import { licensePlateCheckRouter } from './routes/licensePlateCheck.routes'
import { userRouter } from './routes/user.routes'
import { builderRouter } from './routes/builder.routes'
import { cityRouter } from './routes/city.routes'

const router = new Hono()

router.route('/', indexRouter)
router.route('/request', licensePlateCheckRouter)
router.route('/auth', authRouter)
router.route('/user', userRouter)
router.route('/builder', builderRouter)
router.route('/cities', cityRouter)

export default router
