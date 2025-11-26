import { supabase } from "~lib/supabase";

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type == 'SUMMARIZE') {
        const selectedText = request.text;
        summarizeText(selectedText);
    }
});

const summarizeText = async (selectedText) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch('http://localhost:3000/api/summarize', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selectedText })
    });

    const json = await res.json();

    if (res.status == 403) {
        alert("Upgrade to Pro to use AI summarization!");
        return;
    }

    if (json.summary) {
        // Handle incoming summary of the selected text
        console.log(json.summary);
    } else {
        alert("Failed to summarize. Please try again.");
    }
}
