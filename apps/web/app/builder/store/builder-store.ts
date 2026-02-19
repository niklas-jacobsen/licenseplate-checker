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
  isSaving: boolean
  isLoading: boolean
  saveError: string
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

  // getters
  getNodes: () => WorkflowNode[]
  getEdges: () => Edge[]
}

export type BuilderStore = BuilderState & BuilderActions

export const createBuilderStore = (initialState?: Partial<BuilderState>) => {
  return createStore<BuilderStore>()(
    subscribeWithSelector((set, get) => ({
      // state
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      selectedNodeId: null,
      workflowId: null,
      workflowName: 'New Workflow',
      isSaving: false,
      isLoading: false,
      saveError: '',
      ...initialState,

      // reactflow handlers
      onNodesChange: (changes) =>
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
      removeNode: (nodeId) =>
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
            set({ workflowName: wf.name })
            const def = wf.definition as {
              nodes?: WorkflowNode[]
              edges?: Edge[]
            }
            if (def?.nodes) set({ nodes: def.nodes })
            if (def?.edges)
              set({
                edges: def.edges.map((e) => ({
                  ...e,
                  type: 'workflow',
                  animated: true,
                })),
              })
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

      // getters
      getNodes: () => get().nodes,
      getEdges: () => get().edges,
    }))
  )
}
