import React, { useEffect } from "react";
import { useState } from "react";
import { supabase } from "~lib/supabase";
import "./styles/global.css";
import NoteToGoIcon from "./assets/icon.png";
import TrafficLights from "./components//misc/TrafficLight";
import DebugButtons from "./components/misc/DebugButtons";
import type { Session } from "~node_modules/@supabase/auth-js/dist/module";

function Options() {
    const [user, setUser] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [actionType, setActionType] = useState<'signup' | 'signin'>('signup');

    useEffect(() => {
        console.log("THE EXT ENV IS: ", process.env.NODE_ENV);
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data, error } = await supabase
                .auth
                .getSession();

            if (error) {
                console.log(error);
                return;
            }

            if (!!data.session) { // converts data.session to boolean, here true then do
                setUser(data.session.user);
                // sendToBackground({
                //     name: "init-session",
                //     body: {
                //         refresh_token: data.session.refresh_token,
                //         access_token: data.session.access_token,
                //     }
                // });
            } else {
                return;
            }

            if (data.session.user.email_confirmed_at) {
                selectAndInsert(data.session);
            }
        }

        init();
    }, []);

    useEffect(() => {
        const { data: subscription } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_OUT") {
                    setUser(null);
                }

                if (event === "SIGNED_IN" && session.user.email_confirmed_at) {
                    setUser(session.user);

                    // Fire and forget to prevent async dead-end block
                    (async () => {
                        selectAndInsert(session);
                    })();
                }
            }
        );

        return () => {
            subscription.subscription.unsubscribe();
        }
    }, []);

    const selectAndInsert = async (session: Session) => {
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (!userError && !userData) {
            const { data: userInsertData, error: userInsertError } = await supabase
                .from("users")
                .insert({
                    user_id: session.user.id,
                    email: session.user.email,
                })
                .select()
                .maybeSingle();

            if (!userInsertError) {
                setUserDetails(userInsertData);
            }
        } else if (!userError) {
            setUserDetails(userData);
        } else {
            alert("An Error Has Occured, Please Reload The Page...");
            console.error(userError)
        }
    }

    const signUp = async (formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        const redirectUrl =
            process.env.NODE_ENV == "development"
            ? "chrome-extension://jgemkmaojakmnlmbbjjokmkbpdngnckg/options.html"
            : "chrome-extension://aacbmfpcgjlmefmhhbafimdaefpifkjk/options.html"

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
                password,
                options: {
                    emailRedirectTo: redirectUrl
                }
            });

        if (!data || error) {
            console.error(error);
            alert("Error Signing up!");
            return;
        }

        alert("Confirmation Mail Has Been Sent To The Provided Email!, Open The Mail From This Device Only!");
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

        if (!data.user || error) {
            alert("Unable to signin, please make sure the credentials are correct or the account exists");
            return;
        }

        alert("Signed In Successfully!");

        setUser(data.user);
    }

    const signOut = async () => {
        const { error } = await supabase
            .auth
            .signOut();

        if (error) {
            alert(`Error Signing Out, Please Try Again!, ${error.message}`);
            return;
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

    const inputClasses = "w-full rounded-xl h-[45px] text-violet-300 text-xl px-2 outline-none border-2 border-transparent focus:border-2 focus:border-purple-400 bg-neutral-800 transition-[border] duration-[100ms]";

    return (
        <div className="w-dvw h-dvh bg-neutral-800 overflow-hidden flex items-center max-lg:flex-col">
            <div style={{
                    "backgroundColor": "#200436",
                    "backgroundImage": 'url("https://transparenttextures.com/patterns/axiom-pattern.png")'
                }}
                className="w-full h-full absolute z-0"
            />

            <DebugButtons user={user} userDetails={userDetails} supabase={supabase} />

            <div className="w-full flex items-center justify-center h-[200px] gap-[20px] z-10">
                <span className="text-8xl max-sm:text-6xl text-white underline decoration-purple-200 decoration-[4px] underline-offset-4">NoteToGo</span>
                <img src={NoteToGoIcon} className="size-[80px] max-sm:size-[60px]" />
            </div>

            <div className="w-full h-full flex items-center justify-center">
                <form className="bg-neutral-900 w-[400px] h-max flex flex-col items-center justify-center text-white p-8 pt-10 rounded-3xl gap-6 shadow-[0_0_5px_3px_#c084fc] relative" onSubmit={(e) => {
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

                    {!user ? (
                        <>
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

                                <input className={inputClasses} type="password" name="password" />
                            </div>

                            {actionType === 'signup' && 
                                <div className="w-full h-max flex flex-col gap-3">
                                    <span className="text-2xl underline decoration-purple-300">Confirm Password</span>

                                    <input className={inputClasses} type="password" name="confirmPassword" />
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
                        </>
                    ) : (
                        <>
                            <div className="w-full text-center">
                                <div className="text-3xl text-wrap flex flex-col gap-6">
                                    <div>
                                        <span>Signed In As:<br /></span>
                                        <span className="underline text-2xl break-all">
                                            {user.email}
                                        </span>
                                    </div>

                                    <div>
                                        <span>Subscription Plan:<br /></span>
                                        <b className={`text-2xl capitalize ${userDetails?.subscription_status === 'pro' && 'text-yellow-400'}`}>
                                            {userDetails?.subscription_status}
                                        </b>
                                    </div>
                                </div>
                            </div>

                            <button className="border px-10 py-2 text-xl rounded-2xl bg-violet-700 hover:scale-95 transition-[transform]" type="button" onClick={signOut}>
                                Sign Out
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Options;