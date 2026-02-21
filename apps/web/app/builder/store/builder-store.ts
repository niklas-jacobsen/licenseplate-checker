import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import type {
  WorkflowNode,
  CoreNodeType,
} from '@licenseplate-checker/shared/workflow-dsl/types'
import type { NodeStatus } from '../components/nodes/node-status-indicator'
import {
  nodeRegistry,
  BUILDER_REGISTRY_VERSION,
} from '@licenseplate-checker/shared/node-registry'
import { workflowService } from '@/services/workflow.service'

function createNode(
  type: CoreNodeType,
  position: { x: number; y: number }
): WorkflowNode {
  const id = `${type}-${crypto.randomUUID()}`
  const label = nodeRegistry[type]?.label ?? 'Node'

  switch (type) {
    case 'core.click':
      return {
        id,
        type: 'core.click',
        position,
        data: { label, config: { selector: '' } },
      }

    case 'core.typeText':
      return {
        id,
        type: 'core.typeText',
        position,
        data: { label, config: { selector: '', text: '' } },
      }

    case 'core.openPage':
      return {
        id,
        type: 'core.openPage',
        position,
        data: { label, config: { url: '' } },
      }

    case 'core.conditional':
      return {
        id,
        type: 'core.conditional',
        position,
        data: { label, config: { operator: 'exists', selector: '' } },
      }

    case 'core.wait':
      return {
        id,
        type: 'core.wait',
        position,
        data: { label, config: { mode: 'duration', seconds: 1 } },
      }

    case 'core.selectOption':
      return {
        id,
        type: 'core.selectOption',
        position,
        data: { label, config: { mode: 'text', selector: '', text: '' } },
      }

    case 'core.start':
      return {
        id,
        type: 'core.start',
        position,
        data: { label, config: {} },
      }

    case 'core.end':
      return {
        id,
        type: 'core.end',
        position,
        data: { label, config: { outcome: 'available' } },
      }

    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}

const DEFAULT_NODES: WorkflowNode[] = [
  {
    id: 'start',
    type: 'core.start',
    position: { x: 120, y: 140 },
    data: { label: 'Start', config: {} },
  },
  {
    id: 'end',
    type: 'core.end',
    position: { x: 560, y: 140 },
    data: { label: 'End', config: { outcome: 'available' } },
  },
]

const DEFAULT_EDGES: Edge[] = [
  {
    id: 'start-end',
    source: 'start',
    target: 'end',
    sourceHandle: 'next',
    targetHandle: 'in',
    type: 'workflow',
    animated: true,
  },
]

export type BuilderState = {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  workflowId: string | null
  workflowName: string
  cityId: string | null
  websiteUrl: string | null
  isSaving: boolean
  isLoading: boolean
  notFound: boolean
  saveError: string

  // execution
  nodeStatuses: Record<string, NodeStatus>
  isExecuting: boolean
  executionId: string | null
  executionError: { message: string; issues?: string[] } | null
  testsRemaining: number | null

  // test variables
  testVariables: { letters: string; numbers: string }

  // outcome feedback
  lastOutcome: { outcome: string; status: 'SUCCESS' | 'FAILED' } | null

  // publishing
  canPublish: boolean
  isPublished: boolean
  isPublishing: boolean
}

export type BuilderActions = {
  // reactfflow event handlers
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // node ops
  addNode: (node: WorkflowNode) => void
  addNodeByType: (
    type: CoreNodeType,
    position: { x: number; y: number }
  ) => void
  removeNode: (nodeId: string) => void
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void

  // edge ops
  removeEdge: (edgeId: string) => void

  // selection
  setSelectedNodeId: (id: string | null) => void

  // workflow persistence
  loadWorkflow: (id: string) => Promise<void>
  saveWorkflow: () => Promise<void>
  renameWorkflow: (
    name: string
  ) => Promise<{ success: boolean; error?: string }>

  // execution
  testExecute: (variables: {
    letters: string
    numbers: string
  }) => Promise<void>
  stopPolling: () => void
  resetExecution: () => void
  setTestVariables: (variables: { letters: string; numbers: string }) => void
  dismissOutcome: () => void
  confirmOutcome: () => void
  rejectOutcome: () => void
  publishWorkflow: () => Promise<void>
  unpublishWorkflow: () => Promise<void>

  // getters
  getNodes: () => WorkflowNode[]
  getEdges: () => Edge[]
}

export type BuilderStore = BuilderState & BuilderActions

export const createBuilderStore = (initialState?: Partial<BuilderState>) => {
  let pollingTimer: number | null = null

  return createStore<BuilderStore>()(
    subscribeWithSelector((set, get) => ({
      // state
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      selectedNodeId: null,
      workflowId: null,
      workflowName: 'New Workflow',
      cityId: null,
      websiteUrl: null,
      isSaving: false,
      isLoading: false,
      notFound: false,
      saveError: '',
      nodeStatuses: {},
      isExecuting: false,
      executionId: null,
      executionError: null,
      testsRemaining: null,
      testVariables: { letters: '', numbers: '' },
      lastOutcome: null,
      canPublish: false,
      isPublished: false,
      isPublishing: false,
      ...initialState,

      // reactflow handlers
      onNodesChange: (changes) => {
        // prevent deletion of start/end nodes
        const filtered = changes.filter((c) => {
          if (c.type === 'remove') {
            const node = get().nodes.find((n) => n.id === c.id)
            return node?.type !== 'core.start' && node?.type !== 'core.end'
          }
          return true
        })
        const hasStructuralChange = filtered.some(
          (c) => c.type !== 'select' && c.type !== 'dimensions'
        )
        set({
          nodes: applyNodeChanges(filtered, get().nodes) as WorkflowNode[],
          ...(hasStructuralChange && { canPublish: false, isPublished: false }),
        })
      },
      onEdgesChange: (changes) =>
        set({
          edges: applyEdgeChanges(changes, get().edges) as Edge[],
          canPublish: false,
          isPublished: false,
        }),
      onConnect: (connection) => {
        // only one connection per handle -> replace existing
        const edges = get().edges.filter(
          (e) =>
            !(
              e.source === connection.source &&
              e.sourceHandle === (connection.sourceHandle ?? null)
            ) &&
            !(
              e.target === connection.target &&
              e.targetHandle === (connection.targetHandle ?? null)
            )
        )
        set({
          edges: rfAddEdge(
            { ...connection, type: 'workflow', animated: true },
            edges
          ),
          canPublish: false,
          isPublished: false,
        })
      },

      // node ops
      addNode: (node) =>
        set({
          nodes: [...get().nodes, node],
          canPublish: false,
          isPublished: false,
        }),
      addNodeByType: (type, position) => {
        const node = createNode(type, position)
        set({
          nodes: [...get().nodes, node],
          canPublish: false,
          isPublished: false,
        })
      },
      removeNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId)
        if (node?.type === 'core.start' || node?.type === 'core.end') return
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
          selectedNodeId:
            get().selectedNodeId === nodeId ? null : get().selectedNodeId,
          canPublish: false,
          isPublished: false,
        })
      },
      updateNodeConfig: (nodeId, config) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? ({
                  ...n,
                  data: { ...n.data, config: { ...n.data.config, ...config } },
                } as WorkflowNode)
              : n
          ),
          canPublish: false,
          isPublished: false,
        }),

      // edge ops
      removeEdge: (edgeId) =>
        set({
          edges: get().edges.filter((e) => e.id !== edgeId),
          canPublish: false,
          isPublished: false,
        }),

      // selection
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      // persistence
      loadWorkflow: async (id) => {
        set({ isLoading: true, workflowId: id })
        try {
          const res = await workflowService.getById(id)
          const wf = res.data?.workflow
          if (!wf) {
            set({ notFound: true })
            return
          }
          set({
            workflowName: wf.name,
            cityId: wf.cityId,
            websiteUrl:
              (wf.city as { websiteUrl?: string | null }).websiteUrl ?? null,
            isPublished: wf.isPublished,
          })
          const def = wf.definition as {
            nodes?: WorkflowNode[]
            edges?: Edge[]
          }

          const nodes = def?.nodes ?? get().nodes
          const edges = def?.edges ?? get().edges

          set({ nodes, edges })
        } catch (err) {
          console.error('Failed to load workflow', err)
          set({ notFound: true })
        } finally {
          set({ isLoading: false })
        }
      },

      saveWorkflow: async () => {
        const { workflowId, nodes, edges } = get()
        if (!workflowId) return
        set({ isSaving: true, saveError: '' })
        try {
          await workflowService.updateDefinition(workflowId, {
            id: workflowId,
            registryVersion: BUILDER_REGISTRY_VERSION,
            nodes,
            edges,
          })
        } catch {
          set({ saveError: 'Failed to save' })
        } finally {
          set({ isSaving: false })
        }
      },

      renameWorkflow: async (name) => {
        const { workflowId, workflowName } = get()
        if (!workflowId || !name.trim() || name === workflowName) {
          return { success: true }
        }
        const res = await workflowService.update(workflowId, { name })
        if (res.data?.workflow) {
          set({ workflowName: name })
          return { success: true }
        }
        return { success: false, error: res.error || 'Failed to rename' }
      },

      // execution
      setTestVariables: (variables) => set({ testVariables: variables }),
      dismissOutcome: () => set({ lastOutcome: null }),
      confirmOutcome: () => set({ lastOutcome: null, canPublish: true }),
      rejectOutcome: () => set({ lastOutcome: null, canPublish: false }),
      publishWorkflow: async () => {
        const { workflowId, canPublish } = get()
        if (!workflowId || !canPublish) return
        set({ isPublishing: true })
        try {
          const res = await workflowService.publish(workflowId, true)
          if (res.data?.workflow) {
            set({ isPublished: true, canPublish: false })
          }
        } catch {
          // silently fail, user can retry
        } finally {
          set({ isPublishing: false })
        }
      },
      unpublishWorkflow: async () => {
        const { workflowId } = get()
        if (!workflowId) return
        set({ isPublishing: true })
        try {
          const res = await workflowService.publish(workflowId, false)
          if (res.data?.workflow) {
            set({ isPublished: false })
          }
        } catch {
          // silently fail, user can retry
        } finally {
          set({ isPublishing: false })
        }
      },

      testExecute: async (variables) => {
        const { workflowId, cityId, nodes, edges, isExecuting } = get()
        if (!workflowId || isExecuting) return

        set({ testVariables: variables })

        // save first so the backend compiles the latest definition
        set({ isSaving: true, saveError: '' })
        try {
          await workflowService.updateDefinition(workflowId, {
            id: workflowId,
            registryVersion: BUILDER_REGISTRY_VERSION,
            nodes,
            edges,
          })
        } catch {
          set({ isSaving: false, saveError: 'Failed to save before test' })
          return
        }
        set({ isSaving: false })

        // reset statuses and start
        const initialStatuses: Record<string, NodeStatus> = {}
        for (const n of nodes) {
          initialStatuses[n.id] = 'idle'
        }
        set({
          isExecuting: true,
          executionError: null,
          nodeStatuses: initialStatuses,
          executionId: null,
        })

        try {
          const plateVariables = {
            'plate.letters': variables.letters,
            'plate.numbers': variables.numbers,
            'plate.cityId': cityId ?? 'XX',
            'plate.fullPlate': `${cityId ?? 'XX'} ${variables.letters} ${variables.numbers}`,
          }
          const res = await workflowService.testExecute(
            workflowId,
            plateVariables
          )
          if (!res.data) {
            const details = res.errorDetails as
              | { issues?: { message: string }[] }
              | undefined
            const issues = details?.issues?.map((i) => i.message)
            set({
              isExecuting: false,
              canPublish: false,
              executionError: {
                message: res.error || 'Failed to start execution',
                issues,
              },
            })
            return
          }

          const execId = res.data.executionId
          set({
            executionId: execId,
            testsRemaining: res.data.testsRemaining,
          })

          // poll execution status
          const poll = async () => {
            const current = get()
            if (!current.isExecuting || current.executionId !== execId) return

            try {
              const pollRes = await workflowService.getExecution(execId)
              const exec = pollRes.data?.execution
              if (!exec) return

              // update node statuses from completedNodes + currentNodeId
              const statuses: Record<string, NodeStatus> = {}
              for (const n of current.nodes) {
                statuses[n.id] = 'idle'
              }

              if (exec.completedNodes) {
                for (const cn of exec.completedNodes) {
                  statuses[cn.nodeId] =
                    cn.status === 'success' ? 'success' : 'error'
                }
              }

              if (exec.currentNodeId && exec.status === 'RUNNING') {
                statuses[exec.currentNodeId] = 'loading'
              }

              if (exec.status === 'SUCCESS' || exec.status === 'FAILED') {
                if (exec.status === 'FAILED' && exec.errorNodeId) {
                  statuses[exec.errorNodeId] = 'error'
                }
                set({
                  nodeStatuses: statuses,
                  isExecuting: false,
                  executionError:
                    exec.status === 'FAILED'
                      ? {
                          message: exec.result?.error || 'Execution failed',
                        }
                      : null,
                  lastOutcome: {
                    outcome: exec.result?.outcome ?? 'unknown',
                    status: exec.status,
                  },
                })
                return
              }

              set({ nodeStatuses: statuses })

              // schedule next poll
              pollingTimer = window.setTimeout(poll, 1500)
            } catch {
              // keep polling on network errors
              pollingTimer = window.setTimeout(poll, 3000)
            }
          }

          pollingTimer = window.setTimeout(poll, 1000)
        } catch {
          set({
            isExecuting: false,
            executionError: { message: 'Failed to start execution' },
          })
        }
      },

      stopPolling: () => {
        if (pollingTimer) {
          clearTimeout(pollingTimer)
          pollingTimer = null
        }
        set({ isExecuting: false })
      },

      resetExecution: () => {
        if (pollingTimer) {
          clearTimeout(pollingTimer)
          pollingTimer = null
        }
        set({
          isExecuting: false,
          executionId: null,
          executionError: null,
          nodeStatuses: {},
        })
      },

      // getters
      getNodes: () => get().nodes,
      getEdges: () => get().edges,
    }))
  )
}
