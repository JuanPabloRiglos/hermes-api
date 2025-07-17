import type { HermesGraphState } from '../state/types';
import { v4 as uuidv4 } from 'uuid';

// Función para crear estado inicial limpio - entra pregunta del cliente, sale estado incial con la pregunta y los campos necesarios para el flujo posterior del grapho
export const createInitialState = (
  message: string,
  conversationId?: string,
  userIp?: string
): HermesGraphState => {
  return {
    message,
    conversationId,
    userContext: {
      ip: userIp,
      timestamp: new Date(),
    },
    metadata: {
      executionId: uuidv4(),
      nodeExecutions: [],
    },
  };
};

// Función para validar que el estado tenga las propiedades mínimas
export const validateState = (state: HermesGraphState): boolean => {
  return !!(state.message && state.userContext && state.metadata?.executionId);
};

// Función para agregar ejecución de nodo al metadata
export const addNodeExecution = (
  state: HermesGraphState,
  nodeName: string,
  success: boolean,
  duration?: number
): HermesGraphState => {
  const nodeExecution = {
    nodeName,
    timestamp: new Date(),
    success,
    duration,
  };

  return {
    ...state,
    metadata: {
      ...state.metadata,
      nodeExecutions: [...state.metadata.nodeExecutions, nodeExecution],
    },
  };
};

// Función para agregar error al metadata
export const addError = (
  state: HermesGraphState,
  nodeName: string,
  error: string
): HermesGraphState => {
  const errorEntry = {
    nodeName,
    error,
    timestamp: new Date(),
  };

  return {
    ...state,
    metadata: {
      ...state.metadata,
      errors: [...(state.metadata.errors || []), errorEntry],
    },
  };
};

// Función para calcular score de interés basado en palabras clave
export const calculateInterestSignals = (message: string): string[] => {
  const signals: string[] = [];
  const lowercaseMessage = message.toLowerCase();

  // Señales de presupuesto
  if (/\$|peso|precio|costo|presupuesto|cuanto|cotiz/i.test(message)) {
    signals.push('mentioned_budget');
  }

  // Señales de timeline
  if (/urgente|ya|rapido|pronto|cuando|tiempo|fecha|deadline/i.test(message)) {
    signals.push('asked_timeline');
  }

  // Señales de requirements específicos
  if (/necesito|quiero|requiero|busco|debo/i.test(message)) {
    signals.push('specific_requirements');
  }

  // Señales de decision maker
  if (
    /mi empresa|mi negocio|soy el|tengo que decidir|mi emprendimiento/i.test(
      message
    )
  ) {
    signals.push('decision_maker');
  }

  // Señales de urgencia
  if (/urgente|ya|inmediato|asap|lo antes posible/i.test(message)) {
    signals.push('urgency_indicators');
  }

  // Señales de detalles de negocio
  if (/restaurant|tienda|empresa|negocio|consultorio|oficina/i.test(message)) {
    signals.push('business_details');
  }

  return signals;
};

// Función para calcular score de interés (0-100)
export const calculateInterestScore = (
  message: string,
  signals: string[]
): number => {
  let score = 0;

  // Score base por longitud del mensaje (más detalle = más interés)
  score += Math.min(message.length / 10, 20); // Máximo 20 puntos

  // Score por señales detectadas
  const signalScores = {
    mentioned_budget: 25,
    asked_timeline: 20,
    specific_requirements: 15,
    decision_maker: 20,
    urgency_indicators: 15,
    business_details: 10,
  };

  signals.forEach((signal) => {
    if (signalScores[signal as keyof typeof signalScores]) {
      score += signalScores[signal as keyof typeof signalScores];
    }
  });

  // Limitar a 100
  return Math.min(score, 100);
};

// Función para determinar nivel de interés basado en score
export const getInterestLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

// Función para formatear respuesta final
export const formatFinalResponse = (
  response: string,
  nextActions?: string[]
): string => {
  let formattedResponse = response.trim();

  // Agregar call-to-action si hay próximas acciones
  if (nextActions && nextActions.length > 0) {
    if (nextActions.includes('ask_email')) {
      formattedResponse +=
        '\n\n¿Te gustaría que te enviemos más información por email?';
    } else if (nextActions.includes('schedule_call')) {
      formattedResponse +=
        '\n\n¿Te parece que coordinemos una videollamada para explicarte todo en detalle?';
    }
  }

  return formattedResponse;
};

// Función para limpiar y preparar texto para embeddings
export const prepareTextForEmbedding = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Quitar signos de puntuación
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
};

// Función para extraer palabras clave del mensaje
export const extractKeywords = (message: string): string[] => {
  const stopWords = [
    'el',
    'la',
    'de',
    'que',
    'y',
    'a',
    'en',
    'un',
    'es',
    'se',
    'no',
    'te',
    'lo',
    'le',
    'da',
    'su',
    'por',
    'son',
    'con',
    'para',
    'me',
    'una',
    'todo',
    'pero',
    'más',
    'hacer',
    'o',
    'ya',
    'mi',
    'qué',
    'muy',
  ];

  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10); // Máximo 10 keywords
};
