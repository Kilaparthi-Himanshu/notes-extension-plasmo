import { useEffect, useState } from "react";
import React from "react";
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { Pin, X, Save } from "lucide-react";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

function InjectReact({
    noteId,
    rightClickPos
}: {
    noteId: string,
    rightClickPos?: { x: number, y: number }
}) {

    const [position, setPosition] = useState(() => {
        if (rightClickPos?.x !== undefined && rightClickPos?.y !== undefined) {
            return {
                x: rightClickPos.x,
                y: rightClickPos.y
            };
        } // To open the note at the right click position of context menu

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate random position within viewport
        // Subtract note size to keep within bounds
        const randomX = Math.random() * (viewportWidth - 300);  // 300px is note width
        const randomY = Math.random() * (viewportHeight - 200); // 200px is note height

        return {
            x: Math.max(0, randomX),  // Ensure not less than 0
            y: window.scrollY + Math.max(0, randomY)  // Add scroll position
        };
    });
    const [isPremium, setIsPremium] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [theme, setTheme] = useState('light');
    const [zIndex, setZIndex] = useState(9999);
    const [customColor, setCustomColor] = useState('');
    const [pinned, setPinned] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        // Calculate the offset between mouse position and div position
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            // Update position based on mouse movement and offset
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleClose = () => {
        const noteElement = document.getElementById(noteId);
        if (noteElement) {
            // Add fade-out animation
            const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
            if (component) {
                component.classList.add(style.fadeOut);
                // Remove element after animation
                setTimeout(() => {
                    noteElement.remove();
                }, 300); // Match this with animation duration
            }
        }
    };

    const bringToFront = () => {
        const notes = document.querySelectorAll('plasmo-csui');
        let maxZ = 0;

        // Find highest z-index
        notes.forEach(note => {
            const element = note.shadowRoot?.querySelector('#react-injected-component');
            if (element) {
                const z = parseInt(getComputedStyle(element).zIndex) || 0;
                maxZ = Math.max(maxZ, z);
            }
        });

        // Set new z-index higher than the maximum
        setZIndex(maxZ + 1);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const setTextAreaColor = (color: string) => {
        setCustomColor(color); // Store the custom color
        const noteElement = document.getElementById(noteId);
        if (noteElement) {
            const textArea = noteElement.shadowRoot?.querySelector('.textArea');
            if (textArea) {
                (textArea as HTMLElement).style.backgroundColor = color;
            }
        }
    }

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        setCustomColor(''); // Reset custom color when theme changes
    };

    const handlePin = () => {
        if (pinned) {
            // When unpinning, convert fixed position to absolute
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            setPosition({
                x: position.x + scrollX,
                y: position.y + scrollY
            });
        } else {
            // When pinning, convert absolute position to fixed
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            setPosition({
                x: position.x - scrollX,
                y: position.y - scrollY
            });
        }
        setPinned(!pinned);
    };

    const saveNote = async () => {
        try {
            const result = await chrome.storage.local.get("notes");

            const note = {
                id: noteId,
                title: title,
                content: content,
                position: position,
                theme: theme,
                color: customColor,
                isPinned: pinned,
                timestamp: Date.now()
            };

            const notes = result.notes || [];
            const noteIndex = notes.findIndex(n => n.id === noteId);

            if (noteIndex !== -1) {
                notes[noteIndex] = note;
            } else {
                notes.push(note);
            }

            await chrome.storage.local.set({ "notes": notes });

            const finalState = await chrome.storage.local.get("notes");
            console.log("finalState", finalState);
        } catch (error) {
            console.error("Error saving note:", error);
        }
    }

    return (
        <div
            id="react-injected-component"
            className={style.injectedComponent}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: zIndex,
                userSelect: 'none', // Prevents text selection while dragging
                resize: 'both',     // Enable native resizing
                overflow: 'auto',    // Required for resize to work
                position: pinned ? 'fixed' : 'absolute'
            }}
            onMouseDown={bringToFront}
        >
            <div 
                className={style.topbar}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    backgroundColor: theme === "light" ? "white" : "rgb(31, 31, 31)"
                }}
                onMouseDown={handleMouseDown}
            >
                <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={style.topbarInput}
                    style={{
                        backgroundColor: theme === "light" ? "white" : "rgb(31, 31, 31)",
                        color: theme === "light" ? "black" : "white"
                    }}
                    placeholder="Enter The Title..."
                />

                <button
                    onClick={saveNote}
                    className={style.saveButton}
                    disabled={!isPremium}
                    title={!isPremium ? "Premium Required" : "Save Note"}
                >
                    <Save
                        style={{
                            position: "relative",
                            color: isPremium ? "green" : "gray",
                            marginTop: "3px",
                        }}
                    />
                </button>

                <button
                    onClick={handleClose}
                    className={style.closeButton}
                    title="Close Note"
                >
                    <X
                        style={{
                            position: "relative",
                            color: "red",
                            marginTop: "2px"
                        }}
                    />
                </button>
                <input
                    title="Choose note color..."
                    className={style.colorSelector}
                    type="color"
                    onChange={(e) => setTextAreaColor(e.target.value)}
                />
                <Pin 
                    style={{
                        color: pinned
                            ? "red"
                            : theme === "light" ? "black" : "white"
                    }}
                    size={20}  // Adjust size as needed
                    className={style.pinIcon}
                    onClick={handlePin}
                />
            </div>

            <div className={style.textAreaContainer}
                style={{backgroundColor: customColor || (theme === "light" ? "rgb(192, 192, 192)" : "rgb(51, 51, 51)")}}
            >
                <textarea
                    className={style.textArea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        // To check if both Shift and Enter keys are pressed
                        if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault(); // Prevent default behavior

                            // Get current cursor position
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;

                            // Get current value
                            const value = e.currentTarget.value;

                            // Insert new line at cursor position
                            const newValue = value.substring(0, start) + '\n' + value.substring(end);

                            // Update textarea value
                            e.currentTarget.value = newValue;

                            // Move cursor after the new line
                            e.currentTarget.selectionStart = start + 1;
                            e.currentTarget.selectionEnd = start + 1;
                        }
                    }}
                    style={{
                        backgroundColor: customColor || (theme === "light" ? "rgb(192, 192, 192)" : "rgb(51, 51, 51)"),
                        color: theme === "light" ? "black" : "white"
                    }}
                    placeholder="Start Typing..."
                ></textarea>

                <div className={style.themeToggle}>
                    <label title="Light">
                        <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={theme === 'light'}
                            onChange={(e) => handleThemeChange(e.target.value)}
                        />
                        🌞
                    </label>
                    <label title="Dark">
                        <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={theme === 'dark'}
                            onChange={(e) => handleThemeChange(e.target.value)}
                        />
                        🌙
                    </label>
                </div>
            </div>
        </div>
    );
}

export default InjectReact;