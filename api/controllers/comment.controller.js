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

export const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({postID: req.params.postID}).sort({createdAt: -1,});

        const totalComments = await Comment.countDocuments();

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};

export const likeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentID);

        if(!comment){
            return next(errorHandler(404, 'Comment not Found'));
        }

        const userIndex = comment.likes.indexOf(req.user.id);

        if (userIndex === -1) {
            comment.numberOfLikes += 1;
            comment.likes.push(req.user.id);
        } else {
            comment.numberOfLikes -= 1;
            comment.likes.splice(userIndex, 1);
        }

       await comment.save();
       res.status(200).json(comment);
    } catch (error) {
        next(error);
    }
};

export const editComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentID);

        if(!comment){
            return next(errorHandler(404, 'Comment not Found'));
        }

        if (comment.userID !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, 'Not Allowed'));
        }

        const editedComment = await Comment.findByIdAndUpdate(
            req.params.commentID,
            {
                content: req.body.content,
            },
            { new: true }
        );

       res.status(200).json(editedComment);
    } catch (error) {
        next(error);
    }
};