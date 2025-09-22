import React from "react";

export default function DebugButtons ({
    user, 
    supabase
}: {
    user: any
    supabase: any
}) {
    return (
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
                        const { data, error } = await supabase.auth.getSession();
                        if (error) {
                            console.log(error);
                        }
                        console.log(data);
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

                <button className="bg-blue-200 p-4" onClick={() => {
                    const redirectUrl =
                        process.env.NODE_ENV == "development"
                        ? "chrome-extension://jgemkmaojakmnlmbbjjokmkbpdngnckg/options.html"
                        : "chrome-extension://omniokhaanekilmkofmbfnbchoaifnbh/options.html"
                        console.log(redirectUrl);
                }}>
                    Print Redirect Email
                </button>

                <button className="bg-blue-200 p-4" onClick={async () => {
                    const { data: userData, error: userError } = await supabase
                    .from('users')
                    .insert({
                        user_id: user.id,
                        email: user.email
                    })
                    .select();

                    if (!userData || userError) {
                        console.error(userError);
                        return;
                    }
                }}>
                    Insert User
                </button>
            </div>
    );
}