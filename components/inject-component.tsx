import { useEffect, useRef, useState } from "react";
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
import tailwindStyles from "data-text:../styles/global.css";
import TipTapEditor from './TipTapEditor/TipTapEditor';
import { useUser } from "~hooks/useUser";
import { queryClient } from "~lib/queryClient";
import * as Falcon from '~assets/Falcon.jpeg';
import { useFeatureFlags } from "~hooks/useFeatureFlags";
import { hexToRgba } from '~utils/colorFormatChange';
import { SyncConfirmationModal } from './SyncConfirmationModal';
import type { NoteType } from '../types/noteTypes';
import { NoteSyncEngine } from '../lib/sync-engine';
import { persistLocal } from "~lib/sync-engine/storage";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent =  styleText + tailwindStyles;
    return style;
}

function InjectReact({
    noteId,
    rightClickPos,
    note
}: {
    noteId: string,
    rightClickPos?: { x: number, y: number },
    note?: NoteType,
}) {
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
    }, []);

    const { isProUser, canHaveGlassEffect, canUseAdvancedEditor, canUseSync } = useFeatureFlags();

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
        const randomX = Math.random() * (viewportWidth - 378);  // 378px is note width
        const randomY = Math.random() * (viewportHeight - 265); // 265px is note height

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
    const [customColor, setCustomColor] = useState('#ffffff');
    const [pinned, setPinned] = useState(true);
    const [saved, setSaved] = useState(false);
    const [width, setWidth] = useState(378);
    const [height, setHeight] = useState(265);
    const [active, setActive] = useState(false);
    const [iconize, setIconize] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
    const [email, setEmail] = useState('');
    const [glassEffect, setGlassEffect] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);
    const [sync, setSync] = useState(false);
    const [showSyncConfirmationModal, setShowSyncConfirmationModal] = useState(false);
    const [baseVersion, setBaseVersion] = useState(0);
    const [dirty, setDirty] = useState(false);

    // Sync toggle only enabled when note is saved AND sync is not enabled
    const syncToggleEnable = canUseSync && saved && !sync; // canUseSync = isProUser
    // Note can only be edited if note is not synced OR if it is synced then they must be a pro user AND must be online
    const canEditSyncedNote = !sync || (canUseSync && navigator.onLine); // canUseSync = isProUser

    useEffect(() => {
        console.log("NEIN");
        if (note) {
            console.log(note.sync);
            setTitle(note.title);
            setContent(note.content);
            setPosition(note.position);
            setTheme(note.theme);
            setCustomColor(note.color);
            setPinned(note.isPinned);
            setSaved(note.saved ?? false);
            setWidth(note.width);
            setHeight(note.height);
            setActive(note.active);
            setIsPasswordProtected(note.isPasswordProtected);
            setRequirePassword(note.isPasswordProtected);
            setPassword(note.password);
            setEmail(note.email);
            setGlassEffect(canHaveGlassEffect && (note.glassEffect ?? false));
            setShowToolbar(canUseAdvancedEditor && (note.showToolbar ?? false));
            setSync(note.sync ?? false);
            setBaseVersion(note.baseVersion ?? 0);
            setDirty(note.dirty ?? false);
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
        let shouldClose = true;
        if (!saved) {
            shouldClose = window.confirm("The Note Is Unsaved. Do You Want To Close?");
        }

        if (shouldClose) {
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
        }
    };

    const bringToFront = () => {
        const notes = document.querySelectorAll('plasmo-csui');
        let maxZ = 999999;

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
        setCustomColor(newTheme === "light" ? "#ffffff" : "#262626"); // Reset custom color when theme changes
    };

    const assembleNote = (): NoteType => ({
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
        isPasswordProtected: isPasswordProtected,
        password: password,
        email: email,
        glassEffect: glassEffect,
        showToolbar: showToolbar,
        sync: sync,
        baseVersion: baseVersion,
        dirty: dirty,
    });

    const syncEngineRef = useRef<NoteSyncEngine | null>(null);

    // Subscribe to sync engine
    useEffect(() => {
        syncEngineRef.current = new NoteSyncEngine({
            note,
            canSync: isProUser && sync,
            canEditSyncedNote
        });

        return () => {
            syncEngineRef.current = null;
        };
    }, [noteId]);

    useEffect(() => {
        syncEngineRef.current?.setCapabilities({
            canSync: isProUser && sync,
            canEditSyncedNote
        });
    }, [isProUser, sync, canEditSyncedNote]);

    useEffect(() => {
        if (saved) {
            syncEngineRef.current?.updateNote(assembleNote());
        }
    }, [title, content, position, theme, customColor, pinned, width, height, active, isPasswordProtected, password, email, glassEffect, showToolbar, sync, baseVersion, dirty]);

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

    const glassBackgroundStyle = glassEffect ? {
        backgroundColor: hexToRgba(customColor, 0.35),
        backdropFilter: 'blur(16px) saturate(180%)', // frosted + vibrant 
        WebkitBackdropFilter: 'blur(16px) saturate(180%)', // Safari support 
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // soft shadow glow
    } : {
        backgroundColor: customColor,
    }

    const glassEffectBorderStyle = glassEffect && {
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTop: '0px'
    }

    return (
        <>
            {iconize ? 
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
                } as React.CSSProperties}
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
                    ...glassBackgroundStyle,
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
                    // backgroundImage: `url(${Falcon})`,
                    // backgroundSize: "cover",       // Fill the whole div
                    // backgroundRepeat: "no-repeat", // Don’t tile
                    // backgroundPosition: "center",  // Center the image
                }}
                onMouseDown={bringToFront}
                onMouseUp={handleResize}
            >
                <div 
                    className={style.topbar}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        backgroundColor: theme === "light" ? "#D9D9D9" : "#454545",
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className={style.topbarInput}
                        style={{
                            backgroundColor: theme === "light" ? "#D9D9D9" : "#454545",
                            color: theme === "light" ? "black" : "white",
                            pointerEvents: requirePassword ? "none" : "auto",
                        }}
                        placeholder="Enter The Title..."
                        title="Title"
                    />

                    <div className={`w-[170px] h-[35px] absolute right-0 flex justify-end items-center space-x-3 pr-2`} style={{
                        backgroundColor: glassEffect ? theme === "light" ? "#D9D9D9" : "#454545" : customColor,
                    }}>
                        <svg viewBox="0 0 50 35" width="100%" height="100%" preserveAspectRatio="none">
                            <path
                                d="M0,0 L31,0 C3,0 31,35 0,35"
                                fill={theme === "light" ? "#D9D9D9" : "#454545"}
                            />
                        </svg>

                        <button
                            onClick={() => {
                                syncEngineRef.current?.firstLocalSave(assembleNote());
                                setSaved(true);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='bg-green-400 group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale]'
                            title={saved ? "Note Is Saved" : "Save Note"}
                        >
                            {saved ? 
                                <Check
                                    className="hidden group-hover:block transition-[display]"
                                    size={14}
                                    style={{
                                        position: "relative",
                                        color: "green",
                                        marginLeft: '4px',
                                        marginRight: '4px'
                                        // marginTop: "2px",
                                    }}
                                /> :
                                <Save
                                    className="hidden group-hover:block transition-[display]"
                                    size={14}
                                    style={{
                                        position: "relative",
                                        color: "green",
                                        marginLeft: '4px',
                                        marginRight: '4px'
                                        // marginTop: "1px",
                                    }}
                                />
                            }
                        </button>

                        <button
                            onClick={() => setIconize(true)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='bg-[#FFBF48] group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale]'
                            title="Minimize Note"
                        >
                            <Minimize
                                className="hidden group-hover:block transition-[display]"
                                size={14}
                                style={{
                                    position: "relative",
                                    color: "rgb(158, 124, 0)",
                                }}
                            />
                        </button>

                        <button
                            onClick={handleClose}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='bg-[#FF4848] group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale]'
                            title="Close Note"
                        >
                            <X
                                className="hidden group-hover:block"
                                size={14}
                                style={{
                                    position: "relative",
                                    color: "darkred",
                                }}
                            />
                        </button>
                    </div>
                    <DropdownContext.Provider value={{
                            theme , handleThemeChange, customColor, setTextAreaColor, pinned, handlePin, active, handleActive, isPasswordProtected, setIsPasswordProtected, requirePassword, showNewPasswordForm, setShowNewPasswordForm, canHaveGlassEffect, glassEffect, setGlassEffect, showToolbar, setShowToolbar, sync, showSyncConfirmationModal, setShowSyncConfirmationModal, saved, syncToggleEnable
                        }}
                    >
                        <DropDown />
                    </DropdownContext.Provider>
                </div>

                {(() => {
                    if (requirePassword) {
                        return (
                            <PasswordForm 
                                theme={theme} 
                                customColor={customColor}
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
                                customColor={customColor}
                                setShowNewPasswordForm={setShowNewPasswordForm}
                                setPassword={setPassword}
                                email={email}
                                setEmail={setEmail}
                            />
                        );
                    } else if (showSyncConfirmationModal) {
                        return (
                            <SyncConfirmationModal
                                customColor={customColor} 
                                setSync={setSync}
                                setShowSyncConfirmationModal={setShowSyncConfirmationModal}
                                theme={theme}
                            />
                        );
                    } else {
                        return (
                            <div className={`${style.textAreaContainer} relative`}
                                style={{
                                    ...glassEffectBorderStyle,
                                    paddingBottom: !canEditSyncedNote ? "20px" : undefined,
                                    backgroundColor: 'transparent', 
                                    flexDirection: "column", 
                                    flex: 1,
                                }}
                            >
                                <TipTapEditor
                                    content={content}
                                    onChange={setContent}
                                    customColor={customColor}
                                    theme={theme}
                                    showToolbar={showToolbar}
                                    canEditSyncedNote={canEditSyncedNote}
                                />

                                {!canEditSyncedNote && 
                                    <div className="absolute bottom-0 left-0 right-0 z-10 h-max p-1 bg-red-400 flex items-center justify-center text-center text-white font-semibold">
                                        <p>Need a Pro Subcription and an Internet Connection to Edit a Synced Note.</p>
                                    </div>
                                }
                            </div>
                        );
                    }
                })()}
            </div>)}
        </>
    );
}

export default InjectReact;
