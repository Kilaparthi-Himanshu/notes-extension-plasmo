import React from "react";
import { Link } from "react-router-dom";
import TrafficLights from "~components/misc/TrafficLight";
import NoteToGoIcon from "~assets/icon.png";

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
                    />
                </div>

                <div className="relative w-full max-w-[900px] bg-neutral-900 rounded-3xl p-10 shadow-[0_0_5px_3px_#c084fc] text-white">
                    <div className="absolute top-4 right-4">
                        <TrafficLights />
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-bold text-violet-300">
                            🎉 What's New in v3.0
                        </h1>

                        <p className="text-neutral-400 mt-4 text-lg">
                            The biggest NoteToGo update yet.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-green-400 mb-2">
                                ☁️ Synced Notes
                            </h2>

                            <p className="text-neutral-300">
                                Sign in and access your notes across devices.
                                Your notes can now be securely stored in the cloud.
                            </p>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                                🔐 Google Authentication
                            </h2>

                            <p className="text-neutral-300">
                                Sign in using your Google account for quick and
                                secure access.
                            </p>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
                                ✨ Rich Text Editor
                            </h2>

                            <p className="text-neutral-300">
                                Notes now support:
                            </p>

                            <ul className="list-disc ml-6 mt-3 text-neutral-300 space-y-1">
                                <li>Bold & Italics</li>
                                <li>Text Colors</li>
                                <li>Highlights</li>
                                <li>Lists</li>
                                <li>Text Alignment</li>
                                <li>Image Embeds</li>
                                <li>Code Blocks</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-900/40 to-violet-900/40 border border-yellow-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-yellow-300 mb-3">
                                ⭐ Pro Features
                            </h2>

                            <ul className="space-y-2 text-neutral-200">
                                <li>☁️ Cloud Sync</li>
                                <li>🎨 Font Customization</li>
                                <li>✨ Advanced Rich Text Formatting</li>
                                <li>🚀 Future Premium Features</li>
                            </ul>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-red-400 mb-2">
                                ❤️ Thank You
                            </h2>

                            <p className="text-neutral-300">
                                Thanks for supporting NoteToGo. This update lays
                                the foundation for real-time syncing, collaboration,
                                and many more features coming soon.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center mt-10">
                        <Link
                            to="/"
                            className="px-8 py-3 bg-violet-700 hover:bg-violet-600 rounded-xl transition-all active:scale-95 font-semibold"
                        >
                            Back Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhatsNew;
