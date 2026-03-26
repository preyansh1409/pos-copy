import React, { useState, useEffect } from "react";
import "./CreateUser.css";
import "./CreateUserResponsive.css";
import "./CreateUserGrid.css";
import "./CreateUserProfessional.css";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone: "",
    client_name: "",
    username: "",
    password: "",
    user_role: "admin",
    plan_name: "",
    start_date: "",
    expiry_date: "",
    status: "pending",
    amount: "",
    payment_mode: "",
    payment_date: ""
  });

  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/superadmin/registrations");
      const data = await res.json();
      setClients(data.clients);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        client_name: formData.client_name,
        business_name: formData.business_name,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        plan_name: formData.plan_name,
        plan_duration_months: calculateMonths(formData.start_date, formData.expiry_date),
        payment_amount: formData.amount,
        payment_method: formData.payment_mode
      };

      const res = await fetch("http://localhost:5002/api/superadmin/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok) {
        alert("✅ Client registered successfully!");
        setMessage("Client registered successfully!");
        fetchClients(); // Refresh list
        resetForm();
      } else {
        alert("❌ Error: " + (data.message || "Failed to register client"));
      }
    } catch (err) {
      console.error("Registration Error:", err);
      alert("❌ Error: Failed to connect to server");
    }
  };

  const calculateMonths = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  };

  const resetForm = () => {
    setFormData({
      business_name: "",
      email: "",
      phone: "",
      client_name: "",
      username: "",
      password: "",
      user_role: "admin",
      plan_name: "",
      start_date: "",
      expiry_date: "",
      status: "pending",
      amount: "",
      payment_mode: "",
      payment_date: ""
    });
  };

  return (
    <div className="create-user-container professional">
      <div className="create-user-form">
        <h3>Register New Client</h3>
        {message && <p className="success-msg">{message}</p>}
        <form onSubmit={handleSubmit}>
          {/* Client Table Section */}
          <h4>Client Information</h4>
          <div className="client-four-col-grid">
            <div className="form-group">
              <label>Company Name*</label>
              <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email*</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone*</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Created At</label>
              <input type="date" name="client_created_at" onChange={handleChange} />
            </div>
          </div>

          {/* User Table Section */}
          <h4 className="section-heading">Login Information</h4>
          <div className="client-four-col-grid">
            <div className="form-group">
              <label>Name*</label>
              <input type="text" name="client_name" value={formData.client_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Username*</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password*</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role*</label>
              <select name="user_role" value={formData.user_role} onChange={handleChange} required>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>

          {/* Subscription Table Section */}
          <h4 className="section-heading">Subscription</h4>
          <div className="client-four-col-grid">
            <div className="form-group">
              <label>Plan*</label>
              <select name="plan_name" value={formData.plan_name} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date*</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Expiry Date*</label>
              <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Status*</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Payment Table Section */}
          <h4 className="section-heading">Payment Information</h4>
          <div className="client-four-col-grid">
            <div className="form-group">
              <label>Amount*</label>
              <input type="number" name="amount" min="0" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Payment Mode*</label>
              <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Date*</label>
              <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="submit-btn">Register Client</button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
