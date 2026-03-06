"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Activity, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
    const [stats, setStats] = useState({
        total_records_scanned: 0,
        violations_detected: 0,
        compliance_score: 100,
        active_rules: 0
    });

    const [policies, setPolicies] = useState<any[]>([]);

    useEffect(() => {
        // Reusing existing dashboard endpoint to populate report overview
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies`)
            .then(res => res.json())
            .then(data => setPolicies(data))
            .catch(console.error);
    }, []);

    const handleExport = () => {
        const csvRows = [];
        csvRows.push("Executive Summary");
        csvRows.push(`Overall Compliance Score,${stats.compliance_score}%`);
        csvRows.push(`Total Records Audited,${stats.total_records_scanned}`);
        csvRows.push(`Active Enforced Rules,${stats.active_rules}`);
        csvRows.push(`Open Violations,${stats.violations_detected}`);
        csvRows.push("");
        csvRows.push("Policy Artifact Breakdown");
        csvRows.push("Policy Name,Upload Date,Status");
        policies.forEach(p => {
            csvRows.push(`"${p.name}","${p.upload_date}","${p.status}"`);
        });

        // Use full CRLF which Excel requires
        const csvString = "\uFEFF" + csvRows.join("\r\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Compliance Reports</h2>
                    <p className="text-sm text-zinc-500 mt-1">Generate and export audit logs for external regulators.</p>
                </div>

                <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-zinc-400" />
                            Executive Summary
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            High-level overview of the current compliance posture.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/80">
                            <span className="text-zinc-400 text-sm">Overall Compliance Score</span>
                            <span className={`font-bold text-lg ${stats.compliance_score > 90 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                {stats.compliance_score}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/80">
                            <span className="text-zinc-400 text-sm">Total Records Audited</span>
                            <span className="font-bold text-lg text-white">
                                {stats.total_records_scanned.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/80">
                            <span className="text-zinc-400 text-sm">Active Enforced Rules</span>
                            <span className="font-bold text-lg text-blue-400">
                                {stats.active_rules}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/80">
                            <span className="text-zinc-400 text-sm">Open Violations</span>
                            <span className="font-bold text-lg text-red-500">
                                {stats.violations_detected.toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center">
                            <Layers className="h-5 w-5 mr-2 text-zinc-400" />
                            Policy Artifact Breakdown
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Status of all ingested regulatory documents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {policies.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">No policies available for reporting.</div>
                        ) : (
                            <div className="space-y-3">
                                {policies.map(p => (
                                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/80">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                            <span className="text-sm text-zinc-200 font-medium truncate max-w-[200px]">{p.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-xs">
                                            <span className="text-zinc-500">{p.upload_date}</span>
                                            <Badge variant="outline" className={p.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}>
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
