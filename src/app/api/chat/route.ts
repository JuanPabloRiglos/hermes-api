import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getChatCompletion, generateEmbedding } from '@/lib/openai';

// Agregar interfaces
interface ConversationHistoryItem {
  user_message: string;
  bot_response: string;
  created_at: string;
}

interface RelevantContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener datos del request
    const { message, userIp, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // 2. Buscar historial de conversación si existe conversationId
    let conversationHistory: ConversationHistoryItem[] = [];
    if (conversationId) {
      const { data: history } = await supabase
        .from('conversations')
        .select('user_message, bot_response, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10); // Últimos 10 intercambios para no sobrecargar

      conversationHistory = history || [];
    }

    // 3. Generar embedding y buscar contenido relevante (igual que antes)
    const questionEmbedding = await generateEmbedding(message);

    const { data: relevantContent, error: searchError } = await supabase.rpc(
      'search_similar_content',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.7,
        match_count: 3,
      }
    );

    if (searchError) {
      console.error('Error buscando contenido:', searchError);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }

    // 4. Crear contexto con historial + contenido relevante
    const knowledgeContext =
      (relevantContent as RelevantContentItem[])
        ?.map((doc) => `${doc.title}: ${doc.content}`)
        .join('\n\n') || 'No hay información específica disponible.';

    const historyContext =
      conversationHistory.length > 0
        ? conversationHistory
            .map(
              (msg) =>
                `Usuario: ${msg.user_message}\nAsistente: ${msg.bot_response}`
            )
            .join('\n\n')
        : '';

    // 5. Obtener respuesta con contexto completo
    const botResponse = await getChatCompletion(
      message,
      knowledgeContext,
      historyContext
    );

    // 6. Generar conversationId si no existe
    const finalConversationId = conversationId || crypto.randomUUID();

    // 7. Guardar conversación
    const { error: insertError } = await supabase.from('conversations').insert({
      conversation_id: finalConversationId,
      user_message: message,
      bot_response: botResponse,
      user_ip: userIp,
      intent: 'pendiente',
      lead_score: 50,
    });

    if (insertError) {
      console.error('Error guardando conversación:', insertError);
    }

    // 8. Retornar respuesta con conversationId
    return NextResponse.json({
      response: botResponse,
      conversationId: finalConversationId,
      success: true,
    });
  } catch (error) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Test endpoint simple
export async function GET() {
  return NextResponse.json({ message: 'API funcionando!' });
}
