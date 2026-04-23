import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Experience from "@/pages/Experience";
import Success from "@/pages/Success";
import Founder from "@/pages/Founder";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Experience />} />
          <Route path="/success" element={<Success />} />
          <Route path="/founder" element={<Founder />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-center" richColors />
    </div>
  );
}

export default App;
