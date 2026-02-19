import { z } from 'zod'
import { WORKFLOW_NAME_MAX_LENGTH } from '../../constants/limits'

const zWorkflowNameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(WORKFLOW_NAME_MAX_LENGTH, {
    message: `Name must be at most ${WORKFLOW_NAME_MAX_LENGTH} characters`,
  })

export default zWorkflowNameSchema
