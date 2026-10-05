import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateCar from "./pages/CreateCar";
import { AuthProvider } from "./context/AuthContext";
import Favorites from "./pages/Favorites";
import Navbar from "./components/Navbar";
import CarDetails from "./pages/CarDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import Dashboard from "./pages/Dashboard";
import Auctions from "./pages/Auctions";
import CreateAuction from "./pages/CreateAuction";
import SellerDashboard from "./pages/SellerDashboard";
function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
          <Route
  path="/cars"
  element={<Cars />}
/>
        <Route
  path="/cars/:id"
  element={<CarDetails />}
/>
<Route
  path="/favorites"
  element={<Favorites />}
/>
<Route
  path="/dashboard"
  element={<Dashboard />}
/>
<Route
  path="/sell-car"
  element={<CreateCar />}
/>
<Route
  path="/auctions"
  element={<Auctions />}
/>
<Route
  path="/create-auction"
  element={<CreateAuction />}
/>
<Route
  path="/seller"
  element={<SellerDashboard />}
/>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;