import { Hono } from 'hono'
import CityController from '../controllers/City.controller'

export const createCityRouter = (controller: CityController) => {
  const router = new Hono()

  router.get('/', async (c) => {
    try {
      const cities = await controller.getAll()
      return c.json({ cities }, 200)
    } catch (error) {
      console.error('Error fetching cities:', error)
      return c.json({ message: 'Failed to fetch cities', error }, 500)
    }
  })

  return router
}

export const cityRouter = createCityRouter(new CityController())
