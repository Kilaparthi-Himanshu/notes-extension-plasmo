import React from "react";
import { Link } from "react-router-dom";
import TrafficLights from "~components/misc/TrafficLight";
import NoteToGoIcon from "~assets/icon.png";
import { MoveRight } from 'lucide-react';

function WhatsNew() {
    return (
        <div className="relative w-full min-h-dvh bg-neutral-800 overflow-x-hidden text-lg">
            <div
                style={{
                    backgroundColor: "#200436",
                    backgroundImage:
                        'url("https://transparenttextures.com/patterns/axiom-pattern.png")'
                }}
                className="fixed inset-0 z-0"
            />

            <div className="relative z-10 flex flex-col items-center py-12 px-6">
                <div className="flex items-center gap-8 mb-10">
                    <span className="text-6xl text-white underline decoration-purple-200 decoration-[4px] underline-offset-4">
                        NoteToGo
                    </span>

                    <img
                        src={NoteToGoIcon}
                        className="size-[64px]"
                        alt="NoteToGo"
                    />
                </div>

                <div className="relative w-full max-w-[900px] bg-neutral-900 rounded-3xl p-10 shadow-[0_0_5px_3px_#c084fc] text-white">
                    <div className="absolute top-4 right-4">
                        <TrafficLights />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-bold text-violet-300">
                            🎉 Welcome to NoteToGo v3.0
                        </h1>

                        <p className="text-neutral-400 mt-4 text-lg">
                            The biggest update since NoteToGo was launched.
                        </p>
                    </div>

                   <div className="bg-violet-900/30 border border-violet-500 rounded-2xl p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-violet-300 mb-3">
                            🚀 A Huge Step Forward
                        </h2>

                        <p className="text-neutral-200 leading-relaxed">
                            NoteToGo 3.0 is the biggest release yet, introducing cloud sync,
                            Google Sign-In, rich text editing, premium features, and a brand-new
                            foundation for future updates. Thank you for being part of the journey!
                        </p>
                    </div>

                    <div className="space-y-8">

                        {/* Cloud Sync */}
                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-green-400 mb-2">
                                ☁️ Cloud Sync
                            </h2>

                            <p className="text-neutral-300 leading-relaxed">
                                Sign in to securely sync your notes across all
                                your devices. Your notes are now always available
                                whether you're on your desktop, laptop, or another
                                browser.
                            </p>
                        </div>

                        {/* Authentication */}
                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                                🔐 Google Authentication
                            </h2>

                            <p className="text-neutral-300 leading-relaxed">
                                Sign in with your Google account in seconds.
                                Authentication is secure and enables cloud
                                syncing, subscriptions, and future collaborative
                                features.
                            </p>
                        </div>

                        {/* Rich Text */}
                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-yellow-400 mb-3">
                                ✨ Rich Text Editor
                            </h2>

                            <p className="text-neutral-300 mb-3">
                                Create beautiful notes directly on any webpage.
                            </p>

                            <ul className="list-disc ml-6 text-neutral-300 space-y-1">
                                <li>Bold & Italics</li>
                                <li>Fonts</li>
                                <li>Font Sizes</li>
                                <li>Text Colors</li>
                                <li>Highlights</li>
                                <li>Lists</li>
                                <li>Text Alignment</li>
                                <li>Image Embeds</li>
                            </ul>
                        </div>

                        {/* Free */}
                        <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-green-300 mb-3">
                                🎁 Free Features
                            </h2>

                            <ul className="space-y-2 text-neutral-200">
                                <li>📝 Unlimited Local Notes</li>
                                <li>🎨 Themes & Custom Colors</li>
                                <li>✍️ Bold & Italics</li>
                                <li>🔤 Fonts & Font Sizes</li>
                                <li>🌈 Text Colors</li>
                                <li>🔒 Password Protection</li>
                                <li>📌 Pin Notes</li>
                                <li>☁️ 2 Cloud Synced Notes</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="bg-gradient-to-br from-yellow-900/40 to-violet-900/40 border border-yellow-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-yellow-300 mb-3">
                                ⭐ Pro Features
                            </h2>

                            <ul className="space-y-2 text-neutral-200">
                                <li>☁️ Unlimited Cloud Synced Notes</li>
                                <li>⚡ Realtime Sync Across Devices</li>
                                <li>✨ Glass Effect</li>
                                <li>📝 Advanced Rich Text Editor</li>
                                <li>&nbsp;&nbsp;&nbsp;• Highlights</li>
                                <li>&nbsp;&nbsp;&nbsp;• Lists</li>
                                <li>&nbsp;&nbsp;&nbsp;• Text Alignment</li>
                                <li>&nbsp;&nbsp;&nbsp;• Image Embeds</li>
                                <li>📄 Export to HTML, Markdown, PDF & DOCX</li>
                                <li>🚀 Future Premium Features</li>
                            </ul>
                        </div>

                        {/* Thank You */}
                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-red-400 mb-2">
                                ❤️ Thank You
                            </h2>

                            <p className="text-neutral-300 leading-relaxed">
                                Thank you for supporting NoteToGo. Version 3.0
                                is the biggest release yet, bringing cloud sync,
                                Google authentication, rich text editing, and
                                the foundation for even bigger features in the
                                future.
                                <br />
                                <br />
                                I hope you enjoy using it as much as I enjoyed
                                building it.
                            </p>
                        </div>

                    </div>

                    <div className="flex justify-center mt-10">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-4 px-8 py-3 bg-violet-700 hover:bg-violet-600 rounded-xl transition-all active:scale-95 font-semibold"
                        >
                            Start Exploring <MoveRight />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhatsNew;