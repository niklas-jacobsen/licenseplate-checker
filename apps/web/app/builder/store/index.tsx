'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createBuilderStore, type BuilderStore } from './builder-store'

type BuilderStoreApi = ReturnType<typeof createBuilderStore>

const BuilderStoreContext = createContext<BuilderStoreApi | null>(null)

export function BuilderStoreProvider({
  children,
  workflowId,
}: {
  children: ReactNode
  workflowId: string | null
}) {
  const storeRef = useRef<BuilderStoreApi | null>(null)
  if (!storeRef.current) {
    storeRef.current = createBuilderStore({
      workflowId,
      isLoading: !!workflowId,
    })
  }
  return (
    <BuilderStoreContext value={storeRef.current}>
      {children}
    </BuilderStoreContext>
  )
}

export function useBuilderStore<T>(selector: (state: BuilderStore) => T): T {
  const store = useContext(BuilderStoreContext)
  if (!store)
    throw new Error('useBuilderStore must be used within BuilderStoreProvider')
  return useStore(store, selector)
}

export { useShallow }
