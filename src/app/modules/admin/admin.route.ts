import express from 'express';
import { AdminController } from './admin.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { UserRole } from '../user/user.interface';

const router = express.Router();

router.get(
  '/users',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllUsers,
);

router.get(
  '/agents',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllAgents,
);

router.get(
  '/wallets',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllWallets,
);

router.get(
  '/transactions',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllTransactions,
);

router.patch(
  '/block-wallet/:userId',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.blockUserWallet,
);

router.patch(
  '/unblock-wallet/:userId',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.unblockUserWallet,
);

router.patch(
  '/approve-agent/:agentId',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.approveAgent,
);

router.patch(
  '/suspend-agent/:agentId',
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.suspendAgent,
);

export const AdminRoutes = router;