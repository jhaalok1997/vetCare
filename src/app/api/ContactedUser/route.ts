import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import contactedUser from "@/models/ContactedUser";

export async function POST(req: Request) {
    try {
        const { Name, email, message } = await req.json();

        if (!Name || !email || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (!email.includes('@') || !email.includes('.')) {
            return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
        }

        if (message.length < 25) {
            return NextResponse.json({ error: "Message must be at least 25 characters long" }, { status: 400 });
        }

        await connectDB();

        const newContact = await contactedUser.create({
            Name,
            email,
            message
        });

        return NextResponse.json({ 
            message: "Message sent successfully",
            contact: newContact 
        }, { status: 201 });

    } catch (error) {
        console.error("ContactedUser error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}