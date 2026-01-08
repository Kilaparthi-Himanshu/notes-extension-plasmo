export const emitConflict = (noteId: string, payload: {
    local: string,
    remote: string
}) => {
    console.warn("Conflict detected", noteId, payload)
    // show modal / duplicate note / etc
}
