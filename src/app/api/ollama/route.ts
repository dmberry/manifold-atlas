import { NextRequest, NextResponse } from "next/server";

// List available Ollama models
export async function GET(request: NextRequest) {
  const baseUrl = request.headers.get("X-Ollama-Base-URL") || "http://localhost:11434";

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Cannot reach Ollama" }, { status: 502 });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Ollama is not running. Start it with: ollama serve" },
      { status: 502 }
    );
  }
}

// Pull a model
export async function POST(request: NextRequest) {
  const baseUrl = request.headers.get("X-Ollama-Base-URL") || "http://localhost:11434";
  const { model } = await request.json();

  if (!model) {
    return NextResponse.json({ error: "Model name required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${baseUrl}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model, stream: false }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: error || "Pull failed" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, status: data.status });
  } catch {
    return NextResponse.json(
      { error: "Ollama is not running. Start it with: ollama serve" },
      { status: 502 }
    );
  }
}
