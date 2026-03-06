"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    const username = formData.get("username");
    const password = formData.get("password");

    if (username === "Admin2425" && password === "CodeApex@111") {
        const cookieStore = await cookies();
        cookieStore.set("auth_token", "authenticated_admin", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
        redirect("/");
    }

    return { error: "Invalid username or password" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    redirect("/login");
}
