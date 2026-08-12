import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
  return NextResponse.json({
    admin: { id: session.adminId, name: session.name, email: session.email },
  });
}
