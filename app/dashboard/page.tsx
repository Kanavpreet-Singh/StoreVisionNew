"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/my-stores")
        .then((res) => res.json())
        .then((data) => setStores(data.stores || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleDelete = async (storeid: string) => {
    if (!confirm("Are you sure you want to delete this store? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/store/${storeid}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete store");
        return;
      }
      setStores((prev) => prev.filter((s: any) => s.storeid !== storeid));
    } catch {
      alert("Error deleting store.");
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="flex justify-center items-center h-64">Please sign in to view your dashboard.</div>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Card */}
        <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
          <img
            src={session?.user?.image || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <CardTitle className="text-xl">{session?.user?.name}</CardTitle>
            <CardDescription className="text-muted-foreground">{session?.user?.email}</CardDescription>
          </div>
        </Card>

        {/* Stores List */}
        <Card className="p-6">
          <CardTitle className="mb-4">Your Added Stores</CardTitle>
          {loading ? (
            <div>Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="text-muted-foreground">You haven’t added any stores yet.</div>
          ) : (
            <ul className="space-y-4">
              {stores.map((store: any) => (
                <li key={store.storeid} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.address || store.city}</div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/store/edit/${store.storeid}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(store.storeid)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}