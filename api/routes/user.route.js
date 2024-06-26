import express from 'express';
import { deleteUser, test, updateUser, signout, getUsers, getUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/userRouteTest', test);
router.put('/update/:userID', verifyToken, updateUser);
router.delete('/delete/:userID', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userID', getUser);

export default router;