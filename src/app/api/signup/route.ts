import { supabaseClient } from "@/app/lib/supabase"

interface SignupRequest {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
}

export async function POST(req: Request): Promise<Response> {
    const { firstname, lastname, username, password }: SignupRequest = await req.json();
    const { error } = await supabaseClient.from('users').insert({ firstname, lastname, username, password });
    if (error) {
        throw new Error('Error in insert !', error);
    }
    return new Response();
}
