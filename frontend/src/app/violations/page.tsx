"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, BrainCircuit, AlertOctagon, CheckCircle2, ChevronRight, FileSearch, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViolationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedViolation, setSelectedViolation] = useState<any | null>(null);
    const [violations, setViolations] = useState<any[]>([]);

    const [isGenerating, setIsGenerating] = useState(false);

    const fetchViolations = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/violations`);
            const data = await res.json();
            setViolations(data);
            if (data.length > 0 && !selectedViolation) {
                setSelectedViolation(data[0]);
            } else if (selectedViolation) {
                // Keep the active selected violation's state updated
                const updated = data.find((v: any) => v.id === selectedViolation.id);
                if (updated) setSelectedViolation(updated);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchViolations();
    }, []);

    const handleResolve = async (violId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/violations/${violId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Resolved" }),
            });
            fetchViolations();
            if (selectedViolation?.id === violId) {
                setSelectedViolation({ ...selectedViolation, status: "Resolved" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateExplain = async (violId: string) => {
        if (!violId) return;
        setIsGenerating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/violations/${violId}/explain`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.explanation) {
                // Update local state directly so UI reflects immediately without refetch delay
                const newExpl = data.explanation;
                setViolations(prev => prev.map(v => v.id === violId ? { ...v, explanation: newExpl } : v));
                setSelectedViolation((prev: any) => prev && prev.id === violId ? { ...prev, explanation: newExpl } : prev);
            } else {
                fetchViolations(); // Fallback to full fetch
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredViolations = violations.filter(v =>
        v.record_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.dataset_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Violations Overview</h2>
                <p className="text-sm text-zinc-500 mt-1">Review flagged records and AI-generated explainable reasoning.</p>
            </div>

            <div className="flex-1 grid gap-6 md:grid-cols-3 min-h-0">
                <Card className="col-span-2 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm flex flex-col min-h-0">
                    <CardHeader className="pb-3 border-b border-zinc-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-base">Flagged Records</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search records..."
                                className="pl-9 bg-zinc-900 border-zinc-800 text-sm h-9 focus-visible:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto">
                        {filteredViolations.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">No violations match your search, or none exist yet. Run a dataset scan!</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-400 uppercase border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-5 py-3.5 font-medium">Record ID</th>
                                        <th className="px-5 py-3.5 font-medium">Dataset / Rule</th>
                                        <th className="px-5 py-3.5 font-medium text-center">Risk</th>
                                        <th className="px-5 py-3.5 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredViolations.map((v) => (
                                        <tr
                                            key={v.id}
                                            onClick={() => setSelectedViolation(v)}
                                            className={cn(
                                                "transition-colors cursor-pointer group",
                                                selectedViolation?.id === v.id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : "hover:bg-zinc-900/50 border-l-2 border-l-transparent"
                                            )}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center font-medium text-zinc-200">
                                                    {v.risk_score > 85 ? (
                                                        <AlertOctagon className="w-4 h-4 mr-2 text-red-500 shrink-0" />
                                                    ) : (
                                                        <ShieldAlert className="w-4 h-4 mr-2 text-orange-500 shrink-0" />
                                                    )}
                                                    {v.record_id}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-zinc-300">{v.dataset_name}</div>
                                                <div className="text-xs text-blue-400 font-mono mt-0.5 truncate max-w-[180px]">{v.rule_id}</div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={cn(
                                                    "font-mono font-bold",
                                                    v.risk_score > 90 ? "text-red-500" : v.risk_score > 80 ? "text-orange-500" : "text-yellow-500"
                                                )}>
                                                    {v.risk_score}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <Badge variant="outline" className={cn(
                                                        (v.status === "Pending" || v.status === "Open") ? "border-blue-500 text-blue-400 bg-blue-500/10" :
                                                            v.status === "Under Review" ? "border-zinc-500 text-zinc-400 bg-zinc-500/10" :
                                                                "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                                                    )}>
                                                        {v.status === "Open" ? "Pending" : v.status}
                                                    </Badge>
                                                    <ChevronRight className={cn(
                                                        "w-4 h-4 transition-transform",
                                                        selectedViolation?.id === v.id ? "text-blue-500 translate-x-1" : "text-zinc-600 group-hover:text-zinc-400"
                                                    )} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* AI Analysis Pane */}
                {selectedViolation ? (
                    <Card className="col-span-1 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm flex flex-col min-h-0">
                        <CardHeader className="bg-zinc-900/50 border-b border-zinc-800 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-white text-base flex items-center">
                                    <BrainCircuit className="w-5 h-5 mr-2 text-blue-500" />
                                    AI Analysis
                                </CardTitle>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">AI Powered</Badge>
                            </div>
                            <div className="flex space-x-2 text-sm">
                                <span className="text-zinc-400">{selectedViolation.record_id}</span>
                                <span className="text-zinc-600">&bull;</span>
                                <span className="text-blue-400 font-mono text-xs mt-0.5 truncate max-w-[140px]">{selectedViolation.rule_id}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto flex flex-col">
                            <div className="p-5 flex-1 space-y-4">
                                <div className="space-y-2 relative">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Explainable Reasoning</h4>
                                        {selectedViolation.explanation === "Pending background generation..." && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-7 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 border border-blue-500/30 transition-all"
                                                onClick={() => handleGenerateExplain(selectedViolation.id)}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? "Generating..." : "Generate Insights"}
                                                <BrainCircuit className={cn("w-3 h-3 ml-2", isGenerating && "animate-pulse")} />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="bg-zinc-900/80 rounded-lg p-4 text-zinc-300 text-sm leading-relaxed border border-zinc-800/60 font-medium font-sans shadow-inner relative">
                                        {selectedViolation.explanation}
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                                                <div className="flex flex-col items-center">
                                                    <BrainCircuit className="w-8 h-8 text-blue-500 animate-pulse mb-2" />
                                                    <span className="text-xs font-semibold text-blue-400 animate-pulse">Running AI Analysis...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Extracted Feature Context</h4>
                                    <div className="bg-black/40 rounded-lg p-3 border border-zinc-800/50">
                                        <pre className="text-xs text-emerald-400/80 font-mono w-full overflow-x-auto">
                                            {`{
  "risk_impact": "${selectedViolation.risk_score >= 90 ? "Critical" : selectedViolation.risk_score >= 80 ? "High" : selectedViolation.risk_score >= 70 ? "Medium" : "Low"}",
  "confidence_score": "0.${selectedViolation.risk_score}",
  "dataset_origin": "${selectedViolation.dataset_name}",
  "trigger": "${selectedViolation.record_id}"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            <FileSearch className="w-4 h-4 mr-2" />
                                            Review Raw Record
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Raw Record Details</DialogTitle>
                                            <DialogDescription className="text-zinc-400">
                                                The original data row from {selectedViolation?.dataset_name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/50 overflow-hidden">
                                            <div className="overflow-auto max-h-[60vh]">
                                                {selectedViolation?.raw_data ? (
                                                    <table className="w-full text-sm text-left relative m-0">
                                                        <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium tracking-wider">Field</th>
                                                                <th className="px-4 py-3 font-medium tracking-wider">Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-800/60">
                                                            {Object.entries(JSON.parse(selectedViolation.raw_data)).map(([key, value], idx) => (
                                                                <tr key={key} className={idx % 2 === 0 ? "bg-zinc-900/30" : "bg-zinc-900/10 hover:bg-zinc-800/30 transition-colors"}>
                                                                    <td className="px-4 py-3 font-mono text-xs text-blue-400 font-medium whitespace-nowrap border-r border-zinc-800/50 bg-zinc-950/20 w-1/3">
                                                                        {key}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs break-all">
                                                                        {String(value)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-8 text-sm text-zinc-500 text-center flex flex-col items-center">
                                                        <FileSearch className="w-6 h-6 mb-2 opacity-50" />
                                                        No raw data available in the current database.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {selectedViolation.status !== "Resolved" && (
                                    <Button
                                        variant="outline"
                                        className="w-full bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-emerald-900/20 hover:border-emerald-500/50 transition-colors"
                                        onClick={() => handleResolve(selectedViolation.id)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                        Mark as Resolved
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="col-span-1 bg-zinc-950/50 border-zinc-800 backdrop-blur-sm flex items-center justify-center min-h-0 text-center p-6">
                        <div>
                            <BrainCircuit className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-400">No Record Selected</h3>
                            <p className="text-sm text-zinc-600 mt-2">Select a flagged record from the left to view AI's explainable reasoning.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
