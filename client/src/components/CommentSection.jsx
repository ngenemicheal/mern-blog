import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { HiOutlineExclamationCircle } from 'react-icons/hi';


export default function CommentSection({postID}) {
    const { currentUser } = useSelector((state) => state.user);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState(null);
    const [comments, setComments] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    // console.log(comments);
    const navigate = useNavigate();

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (comment.length > 200) {
            return;
        }
        try {
            const res = await fetch('/api/comment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({content: comment, postID, userID:currentUser._id }),
            });
    
            const data = await res.json();
            if (res.ok) {
                setComment('');
                setCommentError(null);
                setComments([data, ...comments]);
            }
        } catch (error) {
            setCommentError(error.message);
        }
    };

    useEffect(() => {
        const getComments = async () => {
            try {
                const res = await fetch(`/api/comment/getcomments/${postID}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        getComments();
    },[postID]);

    const handleLike = async (commentID) => {
        try {
            if (!currentUser) {
                navigate('/sign-in');
                return;
            }
            const res = await fetch(`/api/comment/likeComment/${commentID}`, {
                method: 'PUT',
            });
            if (res.ok) {
                const data = await res.json();
                setComments(comments.map((comment) => 
                    comment._id === commentID ? {
                        ...comment, likes: data.likes, numberOfLikes: data.likes.length,
                    } : comment
                ));
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleEdit = async (comment, editedComment) => {
        setComments(
            comments.map((c) => c._id === comment._id ? {...c, content: editedComment} : c)
        );
    };

    const handleDelete = async (commentID) => {
        setShowDeleteModal(false);
        try {
            if (!currentUser) {
                navigate('/sign-in');
                return;
            }
            const res = await fetch(`/api/comment/deleteComment/${commentID}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                const data = await res.json();
                setComments(comments.filter((comment) => comment._id !== commentID));
            }
        } catch (error) {
            console.log(error.message);
        }
    };

  return (
    <div className='max-w-2xl mx-auto w-full p-3'>
        {currentUser ? (
            <div className='flex items-center gap-1 my-5 text-gray-500 text-sm'>
                <p>Signed in as:</p>
                <img className='h-5 w-5 object-cover rounded-full' src={currentUser.profilePicture} alt='user_image' />
                <Link to={'/dashboard?tab=profile'} className='text-xs text-cyan-600 hover:underline' >@{currentUser.username}</Link>
            </div>
            ) : (
                <div className='text-sm text-teal-500 my-5 flex gap-1'>
                    <p>You must be signed in to comment.</p>
                    <Link className='text-blue-500 hover:underline' to={'/sign-in'}>Sign In</Link>
                </div>
            )
        }
        {currentUser && (
            <form onSubmit={handleCommentSubmit} className='border border-teal-500 rounded-md p-3'>
                <Textarea placeholder='Add a Comment...' rows='3' maxLength='200' onChange={(e) => setComment(e.target.value)} value={comment}/>
                <div className="flex justify-between items-center mt-5">
                    <p className='text-gray-500 text-xs'>{200 - comment.length} characters remaining</p>
                    <Button outline gradientDuoTone='purpleToBlue' type='submit'>Submit</Button>
                </div>
                {commentError && (
                    <Alert color='failure' className='mt-5'>{commentError}</Alert>
                )}
            </form>
        )
        }
        {comments.length === 0 ? (
            <p className='text-sm my-5' >No Comments Yet!</p>
        ) : (
            <>
                <div className="text-sm my-5 flex items-center gap-1">
                    <p>Comments</p>
                    <div className='border border-gray-400 py-1 px-2 rounded-sm'>
                        <p>{comments.length}</p>
                    </div>
                </div>
                {
                    comments.map((comment) => (
                        <Comment key={comment._id} comment={comment} onLike={handleLike} onEdit={handleEdit} onDelete={(commentID)=>{setShowDeleteModal(true); setCommentToDelete(commentID)}} />
                    ))
                }
            </>
             
        )}
        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} popup size='md'>
            <Modal.Header   />
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                    <h3 className='mb-5 text-gray-400 dark:text-gray-200'>Are You Sure?</h3>
                    <div className='flex justify-center gap-4'>
                        <Button color='failure' onClick={()=>handleDelete(commentToDelete)}>Yes</Button>
                        <Button color='gray' onClick={() => setShowDeleteModal(false)}>No</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </div>
  )
}
 