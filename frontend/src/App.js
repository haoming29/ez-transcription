import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";

function App() {
  return (
    <Routes>
      <Route path="/" Component={Home}></Route>
      <Route path="*" Component={Error}></Route>
    </Routes>
  );
}

export default App;
