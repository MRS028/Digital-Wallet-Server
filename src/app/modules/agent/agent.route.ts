import express from 'express';
import { AgentController } from './agent.controller';
import { UserRole } from '../user/user.interface';
import { checkAuth } from '../../middlewares/checkAuth';

const router = express.Router();

router.post(
  '/cash-in',
  checkAuth(UserRole.AGENT),
  AgentController.cashIn,
);

router.post(
  '/cash-out',
  checkAuth(UserRole.AGENT),
  AgentController.cashOut,
);

router.get(
  '/commission-history',
  checkAuth(UserRole.AGENT),
  AgentController.getCommissionHistory,
);

export const AgentRoutes = router;