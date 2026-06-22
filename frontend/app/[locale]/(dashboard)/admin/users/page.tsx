"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (roleFilter) params.role = roleFilter;

    const { data } = await api.get("/admin/users", { params });
    setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  const updateStatus = async (id: number, status: string) => {
    setError("");
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Users</h1>

      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All roles</option>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
        <option value="admin">Admin</option>
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.role !== "admin" && (
                  <>
                    {u.status !== "active" && (
                      <button onClick={() => updateStatus(u.id, "active")}>Activate</button>
                    )}
                    {u.status !== "suspended" && (
                      <button onClick={() => updateStatus(u.id, "suspended")}>Suspend</button>
                    )}
                    {u.status !== "banned" && (
                      <button onClick={() => updateStatus(u.id, "banned")}>Ban</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}