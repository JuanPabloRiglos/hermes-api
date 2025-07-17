// Interfaz principal del estado del grafo
export interface HermesGraphState {
  // Input inicial
  message: string;
  conversationId?: string;
  userContext: {
    ip?: string;
    timestamp: Date;
  };

  // Procesamiento del mensaje
  intent?: {
    type:
      | 'landing_page'
      | 'institutional_site'
      | 'ecommerce'
      | 'blog'
      | 'chatbot_ai'
      | 'automation'
      | 'consultation'
      | 'pricing_inquiry'
      | 'technical_support'
      | 'portfolio_request'
      | 'general_inquiry';
    confidence: number; // 0.0 - 1.0
    category: 'sales' | 'support' | 'information' | 'qualification';
  };

  // Contexto de conocimiento
  knowledgeContext?: {
    relevantDocs: Array<{
      title: string;
      content: string;
      similarity: number;
    }>;
    searchQuery: string;
  };

  // Nivel de interés detectado
  interestLevel?: {
    score: number; // 0-100 (calculado por algoritmo)
    level: 'low' | 'medium' | 'high';
    signals: string[]; // Indicadores de interés comercial:
    // ["mentioned_budget", "asked_timeline", "specific_requirements",
    //  "urgency_indicators", "decision_maker", "business_details"]
  };

  // Datos recolectados del usuario
  collectedData?: {
    email?: string;
    businessName?: string;
    businessType?: string;
    timeline?: string;
    currentWebsite?: string;
    inspirationSites?: string[]; // URLs de sitios que le gustan
    desiredFeatures?: string[]; // ["online_payments", "booking_system", "blog"]
    essentialFeatures?: string[]; // ["mobile_responsive", "fast_loading", "seo_optimized"]
    industry?: string; // "restaurant", "real_estate", "retail", "professional_services"
    targetAudience?: string; // "millennials", "professionals", "families", "businesses"
  };

  // Estado de recolección de datos
  dataCollectionStage?: {
    currentStage:
      | 'email'
      | 'business_info'
      | 'requirements'
      | 'preferences'
      | 'complete';
    questionsAsked: string[];
    pendingQuestions: string[];
  };

  // Respuesta final
  response?: string;

  // Metadata para tracking
  metadata: {
    executionId: string;
    nodeExecutions: Array<{
      nodeName: string;
      timestamp: Date;
      duration?: number;
      success: boolean;
    }>;
    errors?: Array<{
      nodeName: string;
      error: string;
      timestamp: Date;
    }>;
  };

  // Próximas acciones sugeridas
  nextActions?: {
    immediate: string[]; // ["ask_email", "provide_portfolio", "show_examples"]
    followUp: string[]; // ["schedule_call", "send_pricing", "send_case_studies"]
    crmActions: string[]; // ["update_lead_score", "assign_to_sales", "tag_high_priority"]
  };
}

// Tipos auxiliares para nodos
export interface NodeInput {
  state: HermesGraphState;
}

export interface NodeOutput {
  state: HermesGraphState;
}

// Tipos para configuración del grafo
export interface GraphConfig {
  models: {
    intentClassifier: string;
    responseGenerator: string;
    interestDetector: string;
  };
  thresholds: {
    highInterest: number; // Score para considerar high interest (ej: 0.75)
    dataCollection: number; // Score para empezar data collection (ej: 0.6)
    intentConfidence: number; // Confidence mínima para confiar en intent (ej: 0.8)
  };
  prompts: {
    intentClassification: string;
    responseGeneration: string;
    dataCollection: string;
  };
}

// Tipos específicos para mejores validaciones
export type IntentType = NonNullable<HermesGraphState['intent']>['type'];
export type InterestLevel = NonNullable<
  HermesGraphState['interestLevel']
>['level'];
export type DataCollectionStage = NonNullable<
  HermesGraphState['dataCollectionStage']
>['currentStage'];
