import React, { useEffect, type FormEvent } from "react";
import { useState } from "react";
import { supabase } from "~lib/supabase";
import "./styles/global.css";
import NoteToGoIcon from "./assets/icon.png";
import TrafficLights from "./components/TrafficLight";

function Options() {
    const [user, setUser] = useState<any>(null);
    const [actionType, setActionType] = useState<'signup' | 'signin'>('signup');

    useEffect(() => {
        const init = async () => {
            const { data, error } = await supabase
                .auth
                .getSession();

            if (error) {
                console.log(error);
                return;
            }

            if (!!data.session) {
                setUser(data.session.user);
                // sendToBackground({
                //     name: "init-session",
                //     body: {
                //         refresh_token: data.session.refresh_token,
                //         access_token: data.session.access_token,
                //     }
                // });
            }
        }

        init();
    }, []);

    useEffect(() => {
        const { data: subscription } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth event:", event, session);

                if (event === "SIGNED_OUT") {
                    setUser(null);
                }

                if (event === "SIGNED_IN") {
                    setUser(session.user);
                }
            }
        );

        return () => {
            subscription.subscription.unsubscribe();
        }
    }, []);

    const signUp = async (formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!email || !password || !confirmPassword) {
            alert("All Fields Must Be Filled!");
            return;
        }

        if (password != confirmPassword) {
            alert("The Passwords Must Match!");
            return;
        }

        const { data, error } = await supabase
            .auth
            .signUp({
                email,
                password
            });

        console.log("Signed Up user: ", { data, error });
        alert("Confirmation Mail Has Been Sent To The Provided Email!")
        setUser(data.user);
        console.log(data.user);
    }

    const signIn = async (formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const { data, error } = await supabase
            .auth
            .signInWithPassword({
                email,
                password
            });
        console.log("Login result:", { data, error });
        setUser(data.user);
    }

    const signOut = async () => {
        const { error } = await supabase
            .auth
            .signOut();

        if (error) {
            alert(`Error Signing Out, Please Try Again!, ${error.message}`);
        }
    }

    const getSession = async () => {
        const { data } = await supabase
            .auth
            .getSession();

        console.log("Session from storage:", data.session);
        setUser(data.session?.user ?? null);

        chrome.runtime.sendMessage({ type: "PRINT_SESSION" });
    }

    const inputClasses = "w-full rounded-xl h-[45px] text-violet-300 text-xl px-2 outline-none focus:border-2 focus:border-purple-400 bg-neutral-800 transition-[border] duration-[40ms]";

    return (
        <div className="w-dvw h-dvh bg-neutral-800 overflow-hidden flex items-center max-lg:flex-col">
            <div style={{
                    "backgroundColor": "#200436",
                    "backgroundImage": 'url("https://transparenttextures.com/patterns/axiom-pattern.png")'
                }}
                className="w-full h-full absolute z-0"
            />

            <div className="absolute bg-red-500 top-2 left-2 p-4 flex flex-col items-center justify-center gap-2">
                <button className="bg-blue-200 p-4"
                    onClick={() => {
                        console.log(user);
                    }}
                >
                    Log User
                </button>

                <button className="bg-blue-200 p-4"
                    onClick={async () => {
                        console.log(await supabase.auth.getSession());
                    }}
                >
                    Log Session
                </button>

                <button className="bg-blue-200 p-4"
                    onClick={async () => {
                        const { error } = await supabase.auth.signOut();
                        console.log(error);
                    }}
                >
                    Sign Out
                </button>
            </div>

            <div className="w-full flex items-center justify-center h-[200px] gap-[20px] z-10">
                <span className="text-8xl max-sm:text-6xl text-white underline decoration-purple-200 decoration-[4px] underline-offset-4">NoteToGo</span>
                <img src={NoteToGoIcon} className="size-[80px] max-sm:size-[60px]" />
            </div>

            <div className="w-full h-full flex items-center justify-center">
                <form className="bg-neutral-900 w-[400px] h-max flex flex-col items-center justify-center text-white p-8 rounded-3xl gap-6 shadow-[0_0_5px_3px_#c084fc] relative" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    if (actionType === 'signin') {
                        signIn(formData);
                    } else {
                        signUp(formData);
                    }
                }}>
                    <div className="absolute top-2 right-2">
                        <TrafficLights />
                    </div>

                    <div className="w-full h-[30px] relative">
                        <span className="text-4xl absolute -top-3 -left-3">
                            {actionType === 'signin' ? 'Sign In' : 'Sign Up'}
                        </span>
                    </div>

                    <div className="w-full h-max flex flex-col gap-3">
                        <span className="text-2xl underline decoration-purple-300">Email</span>

                        <input className={inputClasses} name="email" />
                    </div>

                    <div className="w-full h-max flex flex-col gap-3">
                        <span className="text-2xl underline decoration-purple-300">Password</span>

                        <input className={inputClasses} name="password" />
                    </div>

                    {actionType === 'signup' && 
                        <div className="w-full h-max flex flex-col gap-3">
                            <span className="text-2xl underline decoration-purple-300">Confirm Password</span>

                            <input className={inputClasses} name="confirmPassword" />
                        </div>
                    }

                    <div className="w-full flex justify-between items-center h-max mt-4">
                        <button className="border px-10 py-2 text-xl rounded-2xl bg-violet-700 hover:scale-95 transition-[transform]" type="submit">
                            Submit
                        </button>

                        <div className="h-full flex items-center">
                            {actionType === 'signup' ? (
                                <div className="flex flex-col items-center justify-center text-lg text-center">
                                    <span className="text-[13px]">
                                        Already have an account?
                                    </span>

                                    <button className="underline" type="button" onClick={() => setActionType('signin')}>
                                        Sign In
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-lg text-center">
                                    <span className="text-[13px]">
                                        Don't have an account?
                                    </span>

                                    <button className="underline" type="button" onClick={() => setActionType('signup')}>
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Options;