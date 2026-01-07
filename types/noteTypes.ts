export type NoteType = {
    id: string,
    title: string,
    content: string,
    position: { 
        x: number, 
        y: number 
    },
    theme: string,
    color: string,
    isPinned: boolean,
    saved: boolean,
    width: number,
    height: number,
    active: boolean,
    isPasswordProtected: boolean,
    password: string,
    email: string,
    glassEffect: boolean,
    showToolbar: boolean,
    sync: boolean,
    baseVersion: number,
    dirty: boolean,
}
