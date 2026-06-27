import { NextRequest, NextResponse } from "next/server";
import { getAllSkills } from "@/lib/skills/skill-store";

export async function GET(_req: NextRequest) {
  try {
    const skills = getAllSkills();
    return NextResponse.json({ skills });
  } catch (err) {
    console.error("[skills/list]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}