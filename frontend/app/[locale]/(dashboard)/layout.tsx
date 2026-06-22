"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, borderRight: "1px solid #ddd", padding: 16 }}>
        <p style={{ fontWeight: "bold" }}>{user?.name}</p>
        <p style={{ fontSize: 12, color: "#666" }}>{user?.role}</p>
        <nav style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {user?.role === "admin" && (
            <>
              <a href="/admin/categories">Categories</a>
              <a href="/admin/users">Users</a>
              <a href="/admin/sellers">Sellers</a>
              <a href="/admin/products">Products</a>
              <a href="/admin/orders">Orders</a>
              <a href="/admin/conversations">Conversations</a>
              <a href="/admin/penalties">Penalties</a>
              <a href="/admin/analytics">Analytics</a>
            </>
          )}
          {user?.role === "seller" && (
            <>
              <a href="/seller/store">My Store</a>
              <a href="/seller/products">My Products</a>
              <a href="/seller/orders">Orders</a>
            </>
          )}
          <a href="/customer/orders">My Orders</a>
          <a href="/customer/wishlist">My Wishlist</a>
          <a href="/messages">Messages</a>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 24 }}>
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}