// Tipos para logging
interface NodeExecution {
  nodeName: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
  input?: any;
  output?: any;
  error?: string;
}

export class GraphLogger {
  private executions: NodeExecution[] = [];

  // Loggear inicio de nodo
  startNode(nodeName: string, input?: any): string {
    const executionId = `${nodeName}-${Date.now()}`;

    console.log(`🚀 [${nodeName}] Starting execution`, {
      timestamp: new Date().toISOString(),
      input: input,
    });

    return executionId;
  }

  // Loggear fin exitoso de nodo
  endNode(nodeName: string, executionId: string, output?: any): void {
    const timestamp = new Date();

    console.log(`✅ [${nodeName}] Completed successfully`, {
      timestamp: timestamp.toISOString(),
      output: output,
    });

    this.executions.push({
      nodeName,
      timestamp,
      success: true,
      output,
    });
  }

  // Loggear error en nodo
  errorNode(nodeName: string, executionId: string, error: Error): void {
    const timestamp = new Date();

    console.error(`❌ [${nodeName}] Failed with error`, {
      timestamp: timestamp.toISOString(),
      error: error.message,
      stack: error.stack,
    });

    this.executions.push({
      nodeName,
      timestamp,
      success: false,
      error: error.message,
    });
  }

  // Obtener historial completo
  getExecutionHistory(): NodeExecution[] {
    return [...this.executions];
  }

  // Limpiar historial
  clear(): void {
    this.executions = [];
  }
}

// Instancia global del logger
export const graphLogger = new GraphLogger();

// Funciones helper para uso fácil
export const logNodeStart = (nodeName: string, input?: any) => {
  return graphLogger.startNode(nodeName, input);
};

export const logNodeEnd = (
  nodeName: string,
  executionId: string,
  output?: any
) => {
  graphLogger.endNode(nodeName, executionId, output);
};

export const logNodeError = (
  nodeName: string,
  executionId: string,
  error: Error
) => {
  graphLogger.errorNode(nodeName, executionId, error);
};
