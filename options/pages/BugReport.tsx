import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "~lib/supabase";
import TrafficLights from "~components/misc/TrafficLight";

export default function BugReport() {
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const [loading, setLoading] = useState(false);

	async function submitBug() {
		if (!title.trim() || !description.trim()) {
			alert("Please fill all fields");
			return;
		}

		try {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				alert("Please sign in first");
				return;
			}

			const { error } = await supabase
				.from("bug_reports")
				.insert({
					user_id: user.id,

					title,
					description,

					browser: navigator.userAgent,

					os: navigator.platform,

					extension_version:
						chrome.runtime.getManifest().version,
				});

			if (error) throw error;

			alert("Bug report submitted!");

			setTitle("");
			setDescription("");

			navigate("/");
		} catch (err) {
			console.error(err);
			alert("Failed to submit bug report");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			style={{
				backgroundColor: "#200436",
				backgroundImage:
					'url("https://transparenttextures.com/patterns/axiom-pattern.png")',
			}}
			className="w-dvw h-dvh flex items-center justify-center"
		>
			<div className="bg-neutral-900 w-[600px] rounded-3xl p-8 text-white shadow-[0_0_5px_3px_#c084fc] relative text-lg">
				<div className="absolute top-2 right-2">
					<TrafficLights />
				</div>

				<h1 className="text-4xl font-semibold mb-8">
					Bug Report
				</h1>

				<div className="flex flex-col gap-5">
					<input
						value={title}
						onChange={(e) =>
							setTitle(e.target.value)
						}
						placeholder="Short title"
						className="bg-neutral-800 rounded-xl h-14 px-4 outline-none border border-transparent focus:border-purple-400"
					/>

					<textarea
						value={description}
						onChange={(e) =>
							setDescription(e.target.value)
						}
						placeholder="Describe the issue..."
						rows={8}
						className="bg-neutral-800 rounded-xl p-4 resize-none outline-none border border-transparent focus:border-purple-400"
					/>

					<button
						onClick={submitBug}
						disabled={loading}
						className="bg-violet-600 hover:bg-violet-700 transition-all rounded-xl h-14 font-semibold"
					>
						{loading
							? "Submitting..."
							: "Submit Bug Report"}
					</button>
				</div>
			</div>
		</div>
	);
}