import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type HostSessionBody = {
  game_id: string;
  title: string;
  city: string;
  address?: string;
  venue_name?: string;
  starts_at: string;
  max_players: number;
  notes?: string;
  captchaToken?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HostSessionBody;

    const {
      game_id,
      title,
      city,
      address,
      venue_name,
      starts_at,
      max_players,
      notes,
      captchaToken,
    } = body;

    if (!captchaToken) {
      return NextResponse.json(
        { error: "Missing reCAPTCHA token" },
        { status: 400 },
      );
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "reCAPTCHA is not configured on the server" },
        { status: 500 },
      );
    }

    const verifyResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(captchaToken)}`,
      },
    );

    const verifyData = (await verifyResponse.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    const score = typeof verifyData.score === "number" ? verifyData.score : 0;

    if (
      !verifyData.success ||
      verifyData.action !== "host_session" ||
      score < 0.5
    ) {
      return NextResponse.json(
        { error: "Failed reCAPTCHA verification" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("game_sessions").insert({
      host_id: user.id,
      game_id,
      title,
      city,
      address: address || null,
      venue_name: venue_name || null,
      starts_at,
      max_players,
      notes: notes || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create session" },
      { status: 500 },
    );
  }
}

