"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UploadCloud, Database, PlayCircle, Loader2, Trash2 } from "lucide-react";

export default function DatasetsPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [datasets, setDatasets] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [scanningId, setScanningId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "analyzing">("idle");

    const fetchDatasets = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets`);
            const data = await res.json();
            setDatasets(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handleDeleteDataset = async (datasetId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets/${datasetId}`, {
                method: "DELETE",
            });
            await fetchDatasets();
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus("uploading");
        setUploadProgress(0);
        setEstimatedTime(null);

        const formData = new FormData();
        formData.append("file", file);

        const startTime = Date.now();

        try {
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/datasets/upload`, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percentComplete);

                        const timeElapsed = (Date.now() - startTime) / 1000;
                        if (timeElapsed > 1 && event.loaded > 0) {
                            const uploadSpeed = event.loaded / timeElapsed;
                            const timeRemaining = (event.total - event.loaded) / uploadSpeed;
                            setEstimatedTime(timeRemaining);
                        }

                        if (percentComplete === 100) {
                            setUploadStatus("analyzing");
                        }
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error("Upload failed"));
                    }
                };

                xhr.onerror = () => reject(new Error("Network Error"));

                xhr.send(formData);
            });
            await fetchDatasets();
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
            alert("Error uploading dataset.");
        } finally {
            setIsUploading(false);
            setUploadStatus("idle");
            setUploadProgress(0);
            setEstimatedTime(null);
        }
    };

    const formatTime = (seconds: number | null) => {
        if (seconds === null || !isFinite(seconds)) return "Calculating time...";
        if (seconds < 1) return "Almost done...";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        if (m > 0) return `${m}m ${s}s remaining`;
        return `${s}s remaining`;
    };

    const runScan = async (datasetId: string) => {
        setScanningId(datasetId);

        try {
            // First, get all active rules to pass to the engine
            const ruleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rules`);
            const rulesData = await ruleRes.json();

            const activeRules = rulesData
                .filter((r: any) => r.status === "Active")
                .map((r: any) => ({ rule: r.logic }));

            if (activeRules.length === 0) {
                alert("No active rules found to scan with.");
                setScanningId(null);
                return;
            }

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engine/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    rules: activeRules
                }),
            });
            // A full app might poll for status or update UI based on response
            alert("Scan completed. Check Violations page.");
        } catch (err) {
            console.error(err);
            alert("Error running scan.");
        } finally {
            setScanningId(null);
            fetchDatasets();
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Datasets</h2>
                    <p className="text-sm text-zinc-500 mt-1">Upload CSV datasets to run compliance checks against extracted rules.</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Upload Dataset
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Upload Structured Dataset</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Upload a CSV file containing the transaction or record data you wish to validate.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center w-full mt-4">
                            <label htmlFor="dataset-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center justify-center space-y-3 w-full px-8">
                                            {uploadStatus === "uploading" ? (
                                                <>
                                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                                                    <span className="text-zinc-300 font-medium">Uploading Dataset ({uploadProgress}%)</span>
                                                    <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-zinc-500">{formatTime(estimatedTime)}</span>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
                                                    <span className="text-emerald-500 animate-pulse font-medium">Analyzing Schema...</span>
                                                    <span className="text-xs text-zinc-500 mt-2">This may take a moment for large files.</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-10 h-10 mb-3 text-zinc-500" />
                                            <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-blue-500">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-zinc-500">CSV files only</p>
                                        </>
                                    )}
                                </div>
                                <input id="dataset-upload" type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white text-base">Available Datasets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-400 uppercase border-b border-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Dataset Name</th>
                                    <th className="px-4 py-3 font-medium">Upload Date</th>
                                    <th className="px-4 py-3 font-medium text-center">Row Count</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {datasets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No datasets uploaded yet.</td>
                                    </tr>
                                ) : datasets.map((ds) => (
                                    <tr key={ds.id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <Database className="h-5 w-5 text-emerald-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-zinc-200">{ds.name}</div>
                                                    <div className="text-xs text-zinc-500">{ds.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-zinc-400">{ds.upload_date}</td>
                                        <td className="px-4 py-4 text-center text-zinc-200 font-medium">
                                            {ds.row_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="outline" className={
                                                ds.status === "Analyzed" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" :
                                                    "border-zinc-500 text-zinc-400 bg-zinc-500/10"
                                            }>
                                                {ds.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                                                onClick={() => runScan(ds.id)}
                                                disabled={scanningId === ds.id}
                                            >
                                                {scanningId === ds.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                                                ) : (
                                                    <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                                                )}
                                                {scanningId === ds.id ? "Scanning with DuckDB..." : "Run Scan"}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDataset(ds.id)} className="h-8 w-8 ml-2 text-red-400 hover:text-red-300 hover:bg-red-400/10">
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
