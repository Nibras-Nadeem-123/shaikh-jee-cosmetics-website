import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

// All user management routes require admin authorization
router.use(isAuthenticatedUser, authorizeRoles('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getSingleUser)
  .put(updateUserRole)
  .delete(deleteUser);

export default router;