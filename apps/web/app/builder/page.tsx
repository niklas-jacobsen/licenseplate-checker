'use client'

// import '@xyflow/react'
import NavBar from 'apps/web/components/nav-bar'

// export default function BuilderPage() {
//   return (
//     <main className="min-h-screen bg-gray-50">
//       <NavBar />
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-5xl mx-auto">
//           <h2 className="text-2xl font-bold text-center mb-2">My Requests</h2>
//           <p className="text-gray-600 text-center mb-8">
//             View and manage the requests you created
//           </p>
//           <LicensePlateRequests />
//         </div>
//       </div>
//     </main>
//   )
// }

import { useState, useCallback } from 'react'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
]
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }]

export default function BuilderPage() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  )
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <NavBar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  )
}
