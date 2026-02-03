import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  // On récupère les clés au moment de l'appel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    
    // On force l'insertion d'un objet propre avec les colonnes existantes
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          full_name: body.full_name || body.name || '', 
          email: body.email || '', 
          phone: body.phone || '', 
          city: body.city || '', 
          service_type: body.service_type || body.type || '', 
          description: body.description || body.message || '', 
          status: 'nouveau'
        }
      ])
      .select();

    if (error) {
      console.log("--- ERREUR DÉTECTÉE ---");
      console.log("Code:", error.code);
      console.log("Message:", error.message);
      console.log("Détails:", error.details);
      console.log("Hint:", error.hint);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ SUCCÈS : Ticket enregistré ID:", data[0].id);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ERREUR CRITIQUE SERVEUR :", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
