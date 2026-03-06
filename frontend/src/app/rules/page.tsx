"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FileText, GitCompareArrows } from "lucide-react";

export default function RulesPage() {
    const [rules, setRules] = useState<any[]>([]);

    const fetchRules = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rules`);
            const data = await res.json();
            setRules(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const toggleRule = async (ruleId: string, currentStatus: string) => {
        const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rules/${ruleId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchRules();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Rule Engine</h2>
                <p className="text-sm text-zinc-500 mt-1">Review and manage the logical rules extracted by AI.</p>
            </div>

            <div className="space-y-4">
                {rules.length === 0 ? (
                    <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-950/50">
                        <GitCompareArrows className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No rules extracted</h3>
                        <p className="text-sm text-zinc-500 mb-4">Upload a policy document to let AI extract rules for the engine.</p>
                    </div>
                ) : rules.map((rule) => (
                    <div
                        key={rule.id}
                        className={`p-5 rounded-xl border ${rule.status === 'Active' ? 'border-zinc-700 bg-zinc-900/40' : 'border-zinc-800/50 bg-zinc-950/30'} flex flex-col space-y-3 transition-colors`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className={`font-semibold ${rule.status === 'Active' ? 'text-blue-400' : 'text-zinc-500'}`}>{rule.id}</span>
                                <Badge variant="outline" className={
                                    rule.status === "Active" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" :
                                        "border-zinc-600 text-zinc-500 bg-zinc-800/30"
                                }>
                                    {rule.status}
                                </Badge>
                            </div>
                            <Switch
                                checked={rule.status === 'Active'}
                                onCheckedChange={() => toggleRule(rule.id, rule.status)}
                            />
                        </div>

                        <div className="bg-black/60 rounded-md p-3 border border-zinc-800 font-mono text-sm overflow-x-auto text-zinc-300 flex items-center">
                            <span className="text-zinc-600 select-none mr-3">{"\u22B6"}</span>
                            {rule.logic}
                        </div>

                        <div className="flex items-center text-xs text-zinc-500 mt-2">
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Source: {rule.policy}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
