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
        data: { label, config: {} },
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
    data: { label: 'End', config: {} },
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
  isSaving: boolean
  isLoading: boolean
  saveError: string

  // execution
  nodeStatuses: Record<string, NodeStatus>
  isExecuting: boolean
  executionId: string | null
  executionError: { message: string; issues?: string[] } | null
  testsRemaining: number | null
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
  testExecute: () => Promise<void>
  stopPolling: () => void
  resetExecution: () => void

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
      isSaving: false,
      isLoading: false,
      saveError: '',
      nodeStatuses: {},
      isExecuting: false,
      executionId: null,
      executionError: null,
      testsRemaining: null,
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
        set({
          nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
        }),
      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) as Edge[] }),
      onConnect: (connection) =>
        set({
          edges: rfAddEdge(
            { ...connection, type: 'workflow', animated: true },
            get().edges
          ),
        }),

      // node ops
      addNode: (node) => set({ nodes: [...get().nodes, node] }),
      addNodeByType: (type, position) => {
        const node = createNode(type, position)
        set({ nodes: [...get().nodes, node] })
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
        }),
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
        }),

      // edge ops
      removeEdge: (edgeId) =>
        set({ edges: get().edges.filter((e) => e.id !== edgeId) }),

      // selection
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      // persistence
      loadWorkflow: async (id) => {
        set({ isLoading: true, workflowId: id })
        try {
          const res = await workflowService.getById(id)
          const wf = res.data?.workflow
          if (wf) {
            set({ workflowName: wf.name, cityId: wf.cityId })
            const def = wf.definition as {
              nodes?: WorkflowNode[]
              edges?: Edge[]
            }
            if (def?.nodes) set({ nodes: def.nodes })
            if (def?.edges) {
              const nodeMap = new Map((def.nodes ?? []).map((n) => [n.id, n]))
              const normalized = def.edges.map((e) => {
                let { sourceHandle, targetHandle } = e
                // infer missing handle id´s from node registry
                if (!sourceHandle) {
                  const sourceNode = nodeMap.get(e.source)
                  if (sourceNode) {
                    const spec = nodeRegistry[sourceNode.type]
                    if (spec?.outputs.length === 1) {
                      sourceHandle = spec.outputs[0].id
                    }
                  }
                }
                if (!targetHandle) {
                  const targetNode = nodeMap.get(e.target)
                  if (targetNode) {
                    const spec = nodeRegistry[targetNode.type]
                    if (spec?.inputs.length === 1) {
                      targetHandle = spec.inputs[0].id
                    }
                  }
                }
                return {
                  ...e,
                  sourceHandle,
                  targetHandle,
                  type: 'workflow',
                  animated: true,
                }
              })
              // deduplicate edges with same connection. !might need to refactor this!
              const seen = new Set<string>()
              const deduped = normalized.filter((e) => {
                const key = `${e.source}:${e.sourceHandle}→${e.target}:${e.targetHandle}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
              set({ edges: deduped })
            }
          }
        } catch (err) {
          console.error('Failed to load workflow', err)
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
      testExecute: async () => {
        const { workflowId, cityId, nodes, edges, isExecuting } = get()
        if (!workflowId || isExecuting) return

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
          const mockVariables = {
            'plate.letters': 'AB',
            'plate.numbers': '1234',
            'plate.cityId': cityId ?? 'XX',
            'plate.fullPlate': `${cityId ?? 'XX'} AB 1234`,
          }
          const res = await workflowService.testExecute(workflowId, mockVariables)
          if (!res.data) {
            const details = res.errorDetails as
              | { issues?: { message: string }[] }
              | undefined
            const issues = details?.issues?.map((i) => i.message)
            set({
              isExecuting: false,
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
