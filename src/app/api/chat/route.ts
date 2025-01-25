import { outputChain } from "@/app/lib/runnables"

export async function POST(req: Request) {
    const userId = req.headers.get('User-Id');
    const { question, history } = await req.json();
    const stream = await outputChain({ userId }).stream({ question, history })

    return new Response(stream)
}