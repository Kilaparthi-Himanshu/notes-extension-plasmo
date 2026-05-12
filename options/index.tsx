// options.tsx
import { HashRouter, Routes, Route } from "react-router-dom";

import SignIn from "./pages/SignIn";
// import Feedback from "./pages/Feedback";
import Home from "./pages/Home";

function Options() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                {/* <Route path="/feedback" element={<Feedback />} /> */}
            </Routes>
        </HashRouter>
    );
}

export default Options;
