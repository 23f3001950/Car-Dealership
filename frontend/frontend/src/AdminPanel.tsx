import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

interface Props {
  token: string | null;
  onVehicleChange: () => void;
}

function AdminPanel({
  token,
  onVehicleChange,
}: Props) {

  // =========================
  // FORM STATE
  // =========================

  const [form, setForm] = useState({
    make: "",
    model: "",
    category: "",
    price: "",
    quantity: "",
  });

  const [selectedId, setSelectedId] =
    useState("");

  const [restockId, setRestockId] =
    useState("");

  const [restockQuantity, setRestockQuantity] =
    useState("");

  // =========================
  // AUTH HEADERS
  // =========================

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // =========================
  // ADD VEHICLE
  // =========================

  const addVehicle = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API}/vehicles`,
        {
          make: form.make,
          model: form.model,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
        },
        {
          headers,
        }
      );

      alert(
        "Vehicle added successfully!"
      );

      setForm({
        make: "",
        model: "",
        category: "",
        price: "",
        quantity: "",
      });

      onVehicleChange();

    } catch (error: any) {

      console.error(
        "ADD VEHICLE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add vehicle"
      );
    }
  };

  // =========================
  // UPDATE VEHICLE
  // =========================

  const updateVehicle = async () => {

    if (!selectedId) {
      alert("Enter vehicle ID");
      return;
    }

    if (
      !form.make ||
      !form.model ||
      !form.category ||
      form.price === "" ||
      form.quantity === ""
    ) {
      alert(
        "Fill all vehicle fields before updating"
      );
      return;
    }

    try {

      await axios.put(
        `${API}/vehicles/${selectedId}`,
        {
          make: form.make,
          model: form.model,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
        },
        {
          headers,
        }
      );

      alert(
        "Vehicle updated successfully!"
      );

      setSelectedId("");

      setForm({
        make: "",
        model: "",
        category: "",
        price: "",
        quantity: "",
      });

      onVehicleChange();

    } catch (error: any) {

      console.error(
        "UPDATE VEHICLE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update vehicle"
      );
    }
  };

  // =========================
  // DELETE VEHICLE
  // =========================

  const deleteVehicle = async () => {

    if (!selectedId) {
      alert("Enter vehicle ID");
      return;
    }

    const confirmed =
      window.confirm(
        `Delete vehicle #${selectedId}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await axios.delete(
        `${API}/vehicles/${selectedId}`,
        {
          headers,
        }
      );

      alert(
        "Vehicle deleted successfully!"
      );

      setSelectedId("");

      onVehicleChange();

    } catch (error: any) {

      console.error(
        "DELETE VEHICLE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete vehicle"
      );
    }
  };

  // =========================
  // RESTOCK
  // =========================

  const restockVehicle = async () => {

    if (
      !restockId ||
      !restockQuantity
    ) {
      alert(
        "Enter vehicle ID and quantity"
      );
      return;
    }

    try {

      await axios.post(
        `${API}/vehicles/${restockId}/restock`,
        {
          quantity:
            Number(restockQuantity),
        },
        {
          headers,
        }
      );

      alert(
        "Vehicle restocked successfully!"
      );

      setRestockId("");
      setRestockQuantity("");

      onVehicleChange();

    } catch (error: any) {

      console.error(
        "RESTOCK ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to restock vehicle"
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <section className="admin-panel">

      <h2>
        ⚙️ Admin Panel
      </h2>

      {/* =========================
          ADD VEHICLE
      ========================= */}

      <h3>
        Add Vehicle
      </h3>

      <form onSubmit={addVehicle}>

        <input
          placeholder="Make"
          value={form.make}
          onChange={(e) =>
            setForm({
              ...form,
              make: e.target.value,
            })
          }
          required
        />

        <input
          placeholder="Model"
          value={form.model}
          onChange={(e) =>
            setForm({
              ...form,
              model: e.target.value,
            })
          }
          required
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: e.target.value,
            })
          }
          required
        />

        <button type="submit">
          Add Vehicle
        </button>

      </form>

      <hr />

      {/* =========================
          UPDATE / DELETE
      ========================= */}

      <h3>
        Manage Vehicle
      </h3>

      <div className="admin-actions">

        <input
          type="number"
          placeholder="Vehicle ID"
          value={selectedId}
          onChange={(e) =>
            setSelectedId(
              e.target.value
            )
          }
        />

        <button
          onClick={updateVehicle}
        >
          Update
        </button>

        <button
          className="danger"
          onClick={deleteVehicle}
        >
          Delete
        </button>

      </div>

      <p className="admin-help">
        To update a vehicle, enter its ID
        and fill the fields above with the
        new details.
      </p>

      <hr />

      {/* =========================
          RESTOCK
      ========================= */}

      <h3>
        Restock Vehicle
      </h3>

      <div className="admin-actions">

        <input
          type="number"
          placeholder="Vehicle ID"
          value={restockId}
          onChange={(e) =>
            setRestockId(
              e.target.value
            )
          }
        />

        <input
          type="number"
          placeholder="Quantity"
          value={restockQuantity}
          onChange={(e) =>
            setRestockQuantity(
              e.target.value
            )
          }
        />

        <button
          onClick={restockVehicle}
        >
          Restock
        </button>

      </div>

    </section>
  );
}

export default AdminPanel;