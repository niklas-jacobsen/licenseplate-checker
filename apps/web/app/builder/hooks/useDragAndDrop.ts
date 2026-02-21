import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useBuilderStore } from '../store'
import type { CoreNodeType } from '@licenseplate-checker/shared/workflow-dsl/types'

export function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow()
  const addNodeByType = useBuilderStore((s) => s.addNodeByType)

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const data = event.dataTransfer.getData('application/reactflow')
      if (!data) return
      const { type } = JSON.parse(data) as { type: CoreNodeType }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNodeByType(type, position)
    },
    [screenToFlowPosition, addNodeByType]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return { onDrop, onDragOver }
}
