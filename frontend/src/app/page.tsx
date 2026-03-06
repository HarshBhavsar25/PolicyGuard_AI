"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";


export default function Dashboard() {
  const [stats, setStats] = useState({
    total_records_scanned: 0,
    violations_detected: 0,
    compliance_score: 100,
    active_rules: 0,
    charts: {
      riskData: [],
      coverageData: [],
      trendData: []
    }
  });

  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/violations`)
      .then(res => res.json())
      .then(data => setViolations(data.slice(0, 5)))
      .catch(console.error);
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Records Scanned</CardTitle>
            <FileText className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{stats.total_records_scanned.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 flex items-center font-medium">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Policy Rules Loaded</CardTitle>
            <ShieldCheck className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{stats.active_rules}</div>
            <p className="text-xs text-emerald-500 flex items-center font-medium">
              <Activity className="h-3 w-3 mr-1" />
              Active on engine
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Violations Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{stats.violations_detected.toLocaleString()}</div>
            <p className="text-xs text-orange-500 flex items-center font-medium">
              <Activity className="h-3 w-3 mr-1" />
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Compliance Score</CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{stats.compliance_score}%</div>
            <p className="text-xs text-emerald-500 flex items-center font-medium">
              <Activity className="h-3 w-3 mr-1" />
              Overall health
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-5 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-base">Violation Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                <AreaChart
                  data={stats.charts?.trendData || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="violations"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViolations)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0 flex flex-col items-center justify-center">
              <ResponsiveContainer width="99%" height="90%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={stats.charts?.riskData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {(stats.charts?.riskData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs text-zinc-400 mt-2">
                {(stats.charts?.riskData || []).map((item: any) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-7 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-4">
            <CardTitle className="text-white text-base">Policy Coverage</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[180px] w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%" minHeight={150}>
                <BarChart data={stats.charts?.coverageData || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Bar dataKey="coverage" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-base">Recent Violations</CardTitle>
          <CardDescription className="text-zinc-500">
            Latest records flagged by the rule engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-6 text-zinc-500">No violations detected yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase border-b border-zinc-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Record ID</th>
                    <th scope="col" className="px-4 py-3 font-medium">Dataset</th>
                    <th scope="col" className="px-4 py-3 font-medium">Rule Triggered</th>
                    <th scope="col" className="px-4 py-3 font-medium">Risk Score</th>
                    <th scope="col" className="px-4 py-3 font-medium">Explanation</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {violations.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-zinc-300">{row.record_id}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{row.dataset_name}</td>
                      <td className="px-4 py-3.5 text-blue-400 font-medium truncate max-w-[150px]">{row.rule_id}</td>
                      <td className="px-4 py-3.5">
                        <span className={row.risk_score > 90 ? "text-red-500 font-medium" : row.risk_score > 80 ? "text-orange-500 font-medium" : row.risk_score > 70 ? "text-yellow-500 font-medium" : "text-emerald-500 font-medium"}>
                          {row.risk_score}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400 max-w-sm truncate">{row.explanation}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge variant="outline" className={
                          (row.status === "Pending" || row.status === "Open") ? "border-blue-500 text-blue-400 bg-blue-500/10" :
                            row.status === "Under Review" ? "border-zinc-500 text-zinc-400 bg-zinc-500/10" :
                              "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                        }>
                          {row.status === "Open" ? "Pending" : row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
