import { z } from 'zod'
import { WORKFLOW_DESCRIPTION_MAX_LENGTH } from '../../constants/limits'

const zWorkflowDescriptionSchema = z
  .string()
  .max(WORKFLOW_DESCRIPTION_MAX_LENGTH, {
    message: `Description cannot exceed ${WORKFLOW_DESCRIPTION_MAX_LENGTH} characters`,
  })

export default zWorkflowDescriptionSchema
