import { useEffect, useState } from "react";
import React from "react";
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { X, Save, Check, Minimize} from "lucide-react";
import { removeNoteIdFromAddedNotesIds } from "../contents/content";
import DropDown from './Dropdown';
import { DropdownContext } from "./context";
import icon from "../assets/icon.png";
import PasswordForm from "./Password/PasswordForm";
import NewPasswordForm from "./Password/NewPasswordForm";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

function InjectReact({
    noteId,
    rightClickPos,
    note
}: {
    noteId: string,
    rightClickPos?: { x: number, y: number },
    note?: {
        id: string,
        title: string,
        content: string,
        position: { x: number, y: number },
        theme: string,
        color: string,
        isPinned: boolean,
        saved: boolean,
        width: number,
        height: number,
        active: boolean,
        font: string,
        fontSize: number,
        fontColor: string,
        isPasswordProtected: boolean,
        password: string,
        email: string
    }
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
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [theme, setTheme] = useState('light');
    const [zIndex, setZIndex] = useState(() => {
        const notes = document.querySelectorAll('plasmo-csui');
        let maxZ = 9999;

        notes.forEach(note => {
            const element = note.shadowRoot?.querySelector('#react-injected-component');
                if (element) {
                    const z = parseInt(getComputedStyle(element).zIndex) || 0;
                    maxZ = Math.max(maxZ, z);
                }
            });

        return maxZ + 1;
    });
    const [customColor, setCustomColor] = useState("#C0C0C0");
    const [pinned, setPinned] = useState(true);
    const [saved, setSaved] = useState(false);
    const [width, setWidth] = useState(300);
    const [height, setHeight] = useState(200);
    const [active, setActive] = useState(false);
    const [font, setFont] = useState('Gill Sans MT');
    const [fontSize, setFontSize] = useState(16);
    const [fontColor, setFontColor] = useState("#000000");
    const [iconize, setIconize] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setPosition(note.position);
            setTheme(note.theme);
            setCustomColor(note.color);
            setPinned(note.isPinned);
            setSaved(note.saved);
            setWidth(note.width);
            setHeight(note.height);
            setActive(note.active);
            setFont(note.font);
            setFontSize(note.fontSize);
            setFontColor(note.fontColor);
            setIsPasswordProtected(note.isPasswordProtected);
            setRequirePassword(note.isPasswordProtected);
            setPassword(note.password);
            setEmail(note.email);
        }
    }, [note]);

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
        setActive(false);
        const noteElement = document.getElementById(noteId);
        if (noteElement) {
            // Add fade-out animation
            const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
            if (component) {
                component.classList.add(style.fadeOut);
                // Remove element after animation
                removeNoteIdFromAddedNotesIds(parseInt(noteId.split('-')[1]));
                setTimeout(() => {
                    noteElement.remove();
                }, 300); // Match this with animation duration
            }
        }
    };

    const bringToFront = () => {
        const notes = document.querySelectorAll('plasmo-csui');
        let maxZ = 9999;

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
        setCustomColor(newTheme === "light" ? "#C0C0C0" : "#333333"); // Reset custom color when theme changes
        setFontColor(newTheme === "light" ? "#000000" : "#ffffff"); // Reset font color when theme changes
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
                timestamp: Date.now(),
                saved: true,
                width: width,
                height: height,
                active: active,
                font: font,
                fontSize: fontSize,
                fontColor: fontColor,
                isPasswordProtected: isPasswordProtected,
                password: password,
                email: email
            };

            const notes = result.notes || [];
            const noteIndex = notes.findIndex(n => n.id === noteId);

            if (noteIndex !== -1) {
                notes[noteIndex] = note;
            } else {
                notes.push(note);
            }

            await chrome.storage.local.set({ "notes": notes });
        } catch (error) {
            console.error("Error saving note:", error);
        }
    }

    useEffect(() => {
        if (saved) {
            saveNote();
        }
    }, [title, content, position, theme, customColor, pinned, width, height, active, font, fontSize, fontColor, setFontColor, isPasswordProtected, password, email]);

    const handleResize = (e: any) => {
        const noteElement = document.getElementById(noteId);
        if (noteElement) {
            const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
            if (component) {
                setWidth(component.clientWidth);
                setHeight(component.clientHeight);
            }
        }
    }

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

    const handleActive = () => {
        setActive(!active);
        console.log("active", !active);
    }

    useEffect(() => {
        // Create event handler for the entire note component
        const stopAllEvents = (e: Event) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        };

        // Get the note element
        const noteElement = document.getElementById(noteId);
        if (noteElement?.shadowRoot) {
            // Add listeners to the shadow root to catch all events
            const eventTypes = ['keydown', 'keyup', 'keypress'];
            eventTypes.forEach(eventType => {
                noteElement.shadowRoot?.addEventListener(eventType, stopAllEvents, true);
            });
        }

        // Cleanup
        return () => {
            if (noteElement?.shadowRoot) {
                const eventTypes = ['keydown', 'keyup', 'keypress'];
                eventTypes.forEach(eventType => {
                    noteElement.shadowRoot?.removeEventListener(eventType, stopAllEvents, true);
                });
            }
        };
    }, [noteId]); // To stop keyboard events from interacting with the outer DOM

    return (
        <>
        { iconize ? 
        (<div data-id={noteId}
            id="react-injected-component"
            title="Double Click To Expand Note"
            className={style.iconized}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: zIndex,
                overflow: 'auto',    // Required for resize to work
                position: pinned ? 'fixed' : 'absolute',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                '--custom-color': customColor,
            }as React.CSSProperties}
            onMouseDown={(e) => {
                handleMouseDown(e);
                bringToFront();
            }}
            onDoubleClick={() => setIconize(false)}
        >
            <img 
                src={icon} 
                alt="icon" 
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{ 
                    userSelect: 'none',
                    pointerEvents: 'none'
                }} 
            />
        </div>) : 
        (<div
            data-id={noteId}
            id="react-injected-component"
            className={style.injectedComponent}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: zIndex,
                userSelect: 'none', // Prevents text selection while dragging
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                resize: 'both',     // Enable native resizing
                overflow: 'auto',    // Required for resize to work
                position: pinned ? 'fixed' : 'absolute',
            }}
            onMouseDown={bringToFront}
            onMouseUp={handleResize}
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
                    onKeyDown={(e) => e.stopPropagation()}
                    className={style.topbarInput}
                    style={{
                        backgroundColor: theme === "light" ? "white" : "rgb(31, 31, 31)",
                        color: theme === "light" ? "black" : "white",
                        pointerEvents: requirePassword ? "none" : "auto",
                    }}
                    placeholder="Enter The Title..."
                    title="Title"
                />

                <button
                    onClick={() => setIconize(true)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={style.iconizeButton}
                    title="Minimize Note"
                >
                    <Minimize
                        style={{
                            position: "relative",
                            color: theme === "light" ? "black" : "white",
                            marginTop: "4px"
                        }}
                    />
                </button>

                <button
                    onClick={() => {
                        saveNote();
                        setSaved(true);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={style.saveButton}
                    title={saved ? "Note Is Saved" : "Save Note"}
                >
                    {saved ? 
                        <Check
                        style={{
                            position: "relative",
                            color: "green",
                            marginTop: "2px",
                        }}
                        /> : 
                        <Save
                            style={{
                                position: "relative",
                                color: "green",
                                marginTop: "1px",
                            }}
                        />
                    }
                </button>

                <button
                    onClick={handleClose}
                    onMouseDown={(e) => e.stopPropagation()}
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
                <DropdownContext.Provider value={{theme , handleThemeChange, customColor, setTextAreaColor, pinned, handlePin, active, handleActive, font, setFont, fontSize, setFontSize, fontColor, setFontColor, isPasswordProtected, setIsPasswordProtected, requirePassword, showNewPasswordForm, setShowNewPasswordForm}}>
                    <DropDown />
                </DropdownContext.Provider>
            </div>

            {(() => {
                if (requirePassword) {
                    return (
                        <PasswordForm 
                            theme={theme} 
                            setRequirePassword={setRequirePassword}
                            password={password}
                            email={email}
                            setShowNewPasswordForm={setShowNewPasswordForm}
                        />
                    );
                } else if (showNewPasswordForm) {
                    return (
                        <NewPasswordForm 
                            theme={theme} 
                            setShowNewPasswordForm={setShowNewPasswordForm}
                            setPassword={setPassword}
                            email={email}
                            setEmail={setEmail}
                        />
                    );
                } else {
                    return (
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
                                    color: fontColor || (theme === "light" ? "black" : "white"),
                                    fontFamily: font,
                                    fontSize: `${fontSize}px`,
                                }}
                                placeholder="Start Typing..."
                                onFocus={(e) => {
                                    // When textarea is focused, create an invisible overlay just for keyboard events
                                    const overlay = document.createElement('div');
                                    overlay.id = 'keyboard-overlay';
                                    overlay.style.cssText = `
                                        position: fixed;
                                        top: 0;
                                        left: 0;
                                        width: 100vw;
                                        height: 100vh;
                                        z-index: 2147483646;
                                        background: transparent;
                                        pointer-events: none;
                                    `;
                                    document.body.appendChild(overlay);
                                }}
                                onBlur={() => {
                                    // Remove overlay when textarea loses focus
                                    const overlay = document.getElementById('keyboard-overlay');
                                    if (overlay) overlay.remove();
                                }}
                            ></textarea>
                        </div>
                    );
                }
            })()}
        </div>)}
        </>
    );
}

export default InjectReact;