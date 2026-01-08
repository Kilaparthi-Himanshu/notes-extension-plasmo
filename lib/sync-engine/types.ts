export type SyncCapabilities = {
    canSync: boolean // isProUser && syncEnabled
    canEditSyncedNote: boolean // online + pro
}

export type SyncPatch = Partial<{
    content: string
    baseVersion: number
    dirty: boolean
}>

export type Listener = (s: SyncPatch) => void

export type RemoteNote = {
  content: string
  version: number
}
