"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, UploadCloud, FileType2, CheckCircle2, Trash2 } from "lucide-react";

export default function PoliciesPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [policies, setPolicies] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchPolicies = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies`);
            const data = await res.json();
            setPolicies(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleDeletePolicy = async (policyId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/${policyId}`, {
                method: "DELETE",
            });
            await fetchPolicies();
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/upload`, {
                method: "POST",
                body: formData,
            });
            await fetchPolicies();
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Policies</h2>
                    <p className="text-sm text-zinc-500 mt-1">Manage compliance policies and extract logical rules.</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Upload Policy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Upload Policy Document</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Upload a PDF document. AI will automatically extract and structure the compliance rules.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center w-full mt-4">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <span className="text-blue-500 animate-pulse font-medium">Extracting Rules via AI...</span>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-10 h-10 mb-3 text-zinc-500" />
                                            <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-blue-500">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-zinc-500">PDF documents only (MAX. 10MB)</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white text-base">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-400 uppercase border-b border-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Policy Name</th>
                                    <th className="px-4 py-3 font-medium">Upload Date</th>
                                    <th className="px-4 py-3 font-medium text-center">Rules Extracted</th>
                                    <th className="px-4 py-3 font-medium text-right">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {policies.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No policies uploaded yet. Database is fresh.</td>
                                    </tr>
                                ) : policies.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <FileType2 className="h-5 w-5 text-red-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-zinc-200">{policy.name}</div>
                                                    <div className="text-xs text-zinc-500">{policy.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-zinc-400">{policy.upload_date}</td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                                                {policy.rules_count} Rules
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {policy.status === "Active" ? (
                                                <span className="inline-flex items-center text-emerald-500 text-sm font-medium">
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-yellow-500 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse" />
                                                    {policy.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeletePolicy(policy.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
