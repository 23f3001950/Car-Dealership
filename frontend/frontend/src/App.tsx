import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import AdminPanel from "./AdminPanel";

const API = "http://localhost:5000/api";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

function isAdmin(token: string | null): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log("JWT PAYLOAD:", payload);

return String(payload.role).toLowerCase() === "admin";  } catch (error) {
    console.error("Failed to decode token:", error);
    return false;
  }
}

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const admin = isAdmin(token);

  console.log("IS ADMIN:", admin);

  // =========================
  // LOAD VEHICLES
  // =========================

  const loadVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);

      console.log("VEHICLES FROM API:", response.data);

      if (Array.isArray(response.data)) {
        setVehicles(response.data);
      } else {
        console.error("Expected array:", response.data);
        setVehicles([]);
      }
    } catch (error) {
      console.error("FAILED TO LOAD VEHICLES:", error);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const receivedToken = response.data.token;

      console.log("LOGIN RESPONSE:", response.data);
      console.log("TOKEN:", receivedToken);

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);

      await loadVehicles();
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  // =========================
  // PURCHASE
  // =========================

  const purchase = async (id: number) => {
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      await axios.post(
        `${API}/vehicles/${id}/purchase`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Vehicle purchased successfully!");

      await loadVehicles();
    } catch (error: any) {
      console.error("PURCHASE ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Purchase failed."
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setEmail("");
    setPassword("");
  };

  // =========================
  // SEARCH
  // =========================

  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model} ${vehicle.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // LOGIN PAGE
  // =========================

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>🚗 CarDeal</h1>

          <p>Car Dealership Inventory System</p>

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              Login
            </button>
          </form>

          <p className="hint">
            Use your registered account or seeded admin account.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="app">

      {/* HEADER */}

      <header>
        <div>
          <h1>🚗 CarDeal</h1>
          <p>Vehicle Inventory</p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      {/* ADMIN PANEL */}

      {admin && (
        <AdminPanel
          token={token}
          onVehicleChange={loadVehicles}
        />
      )}

      {/* MAIN */}

      <main>

        {/* SEARCH */}

        <div className="toolbar">

          <input
            type="text"
            placeholder="Search make, model or category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <span>
            {filteredVehicles.length} vehicles
          </span>

        </div>

        {/* VEHICLES */}

        <div className="vehicle-grid">

          {filteredVehicles.length === 0 ? (

            <div className="empty-state">

              <h2>
                No vehicles found
              </h2>

              <p>
                Try changing your search or add a vehicle
                from the Admin Panel.
              </p>

            </div>

          ) : (

            filteredVehicles.map((vehicle) => (

              <div
                className="vehicle-card"
                key={vehicle.id}
              >

                <div className="vehicle-icon">
                  🚘
                </div>

                <h2>
                  {vehicle.make}{" "}
                  {vehicle.model}
                </h2>

                <span className="category">
                  {vehicle.category}
                </span>

                <p className="price">
                  ₹
                  {Number(
                    vehicle.price
                  ).toLocaleString("en-IN")}
                </p>

                <p>
                  Available stock:{" "}
                  <strong>
                    {vehicle.quantity}
                  </strong>
                </p>

                <button
                  disabled={
                    vehicle.quantity === 0
                  }
                  onClick={() =>
                    purchase(vehicle.id)
                  }
                >
                  {vehicle.quantity === 0
                    ? "Out of Stock"
                    : "Purchase"}
                </button>

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default App;