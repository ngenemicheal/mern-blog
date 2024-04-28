import express from 'express';
import { createComment, getComments, likeComment, editComment, deleteComment } from '../controllers/comment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/getcomments/:postID', getComments);
router.put('/likeComment/:commentID', verifyToken, likeComment);
router.put('/editComment/:commentID', verifyToken, editComment);
router.delete('/deleteComment/:commentID', verifyToken, deleteComment);

export default router;