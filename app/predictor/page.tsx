"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { fixLeafletIcons } from "@/lib/fix-leaflet-icon"
import {
  Card,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { MapPin } from "lucide-react"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

const cityCoords: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Chandigarh: [30.7333, 76.7794],
  Hyderabad: [17.385, 78.4867],
  Kolkata: [22.5726, 88.3639],
  Chennai: [13.0827, 80.2707],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B266FF"]

interface Suggestion {
  lat: number
  lon: number
  covers: number
  percentage: string
}

interface DensityZone {
  zone: string
  orders: number
  density: string
}

export default function PredictorPage() {
  useEffect(() => fixLeafletIcons(), [])

  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [densityZones, setDensityZones] = useState<DensityZone[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [error, setError] = useState("")
  const [noOrdersMsg, setNoOrdersMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setNoOrdersMsg("")
    setSuggestions([])
    setDensityZones([])
    setTotalOrders(0)

    try {
      const res = await fetch("/api/suggest-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.message === "No unfulfilled orders") {
          setNoOrdersMsg("No unfulfilled orders found for this city.")
        } else {
          const suggestions = data.suggestions || []
          //@ts-ignore
          const zones: DensityZone[] = suggestions.map((s, i) => ({
            zone: `Zone ${i + 1}`,
            orders: s.covers,
            density: s.covers > 50 ? "High" : s.covers > 20 ? "Medium" : "Low",
          }))

          setSuggestions(suggestions)
          setDensityZones(zones)
          setTotalOrders(data.totalUnfulfilledOrders || 0)
        }
      } else {
        setError(data.error || "Something went wrong.")
      }
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Form Card */}
        <Card className="p-6">
          <CardTitle>Predict Best Store Locations</CardTitle>
          <CardDescription className="mb-4">
            Select a city to get suggested locations for new stores based on unfulfilled orders.
          </CardDescription>
          <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleSubmit}>
            <div className="flex-1 space-y-2">
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                className="w-full px-3 py-2 border rounded bg-background text-foreground"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              >
                <option value="">Select city</option>
                {Object.keys(cityCoords).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="lg" disabled={loading || !city}>
              {loading ? "Analyzing..." : "Analyze Demand"}
            </Button>
          </form>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </Card>

        {/* No Orders Message */}
        {noOrdersMsg && <Card className="p-6 text-center text-muted-foreground font-medium">{noOrdersMsg}</Card>}

        {/* Map & Analytics */}
        {suggestions.length > 0 && (
          <>
            {/* Map Card */}
            <Card className="p-6">
              <CardTitle className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                Suggested Store Locations
              </CardTitle>
              <div className="h-96 w-full rounded-lg overflow-hidden border">
                <MapContainer
                  center={cityCoords[city]}
                  zoom={12}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {suggestions.map((s, idx) => (
                    <Marker key={`${s.lat}-${s.lon}-${idx}`} position={[s.lat, s.lon]}>
                      <Popup>
                        <div className="space-y-1">
                          <div><b>Coverage:</b> {s.covers} orders</div>
                          <div><b>Percentage:</b> {s.percentage}</div>
                          <div><b>Zone:</b> {densityZones[idx]?.density} Density</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <span>Total unfulfilled orders: <b>{totalOrders}</b></span> &nbsp;|&nbsp;
                <span>Suggested locations: <b>{suggestions.length}</b></span>
              </div>
            </Card>

            {/* Analytics Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              <Card className="p-4">
                <CardTitle className="mb-4">Coverage Distribution</CardTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={suggestions}
                        dataKey="covers"
                        nameKey="percentage"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ percentage }) => percentage}
                      >
                        {suggestions.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Bar Chart */}
              <Card className="p-4">
                <CardTitle className="mb-4">Density Analysis</CardTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={densityZones}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Summary */}
              <Card className="p-4">
                <CardTitle className="mb-4">Summary Statistics</CardTitle>
                <div className="space-y-4">
                  <SummaryItem label="High Density Zones" count={densityZones.filter(z => z.density === "High").length} color="text-green-600" />
                  <SummaryItem label="Medium Density Zones" count={densityZones.filter(z => z.density === "Medium").length} color="text-yellow-600" />
                  <SummaryItem label="Low Density Zones" count={densityZones.filter(z => z.density === "Low").length} color="text-blue-600" />
                  <SummaryItem label="Avg Orders/Zone" count={Math.round(totalOrders / suggestions.length)} highlight />
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function SummaryItem({ label, count, color = "", highlight = false }: { label: string, count: number, color?: string, highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted"}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{count}</span>
    </div>
  )
}
