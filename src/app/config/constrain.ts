import { agentStatus } from "../modules/agent/agent.interface";
import { envVars } from "./env";

export const APP_CONSTANTS = {
  AGENT_STATUSES: agentStatus,
  AGENT_COMMISSION: envVars.AGENT_COMMISSION || 1,
  TRANSACTION_FEE: envVars.TRANSACTION_FEE || 0.5,
  RATE_LIMIT_WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS || 100000,
  RATE_LIMIT_MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS || 1000
};
