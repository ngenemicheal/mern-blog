import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';

export const createComment = async (req, res, next) => {
    try {
        const { content, postID, userID } = req.body;

        if (userID !== req.user.id) {
            next(errorHandler(400, 'Not Allowed'));
        }
    
        const newComment = new Comment({
            content,
            postID,
            userID,
        });
        
        await newComment.save();
        res.status(200).json(newComment);
    } catch (error) {
        next(error);
    }
};