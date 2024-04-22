import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { app } from '../firebase';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../app/user/userSlice.js';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashProfile() {
    const { currentUser, error } = useSelector((state)=> state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageUploading, setImageUploading] = useState(null);
    const [imageUploadingError, setImageUploadingError] = useState(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserFailure, setUpdateUserFailure] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({});
    const filePickerRef = useRef();
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (imageFile) {
            uploadImage();
        }
    }, [imageFile]);

    const uploadImage = async () => {
        setImageUploaded(true);
        setImageUploadingError(null);
        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageUploading(progress.toFixed(0));
            },
            (error) => {
                setImageUploadingError('Could not upload Image (Image must be less than 2MB)');
                setImageUploading(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageUploaded(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL);
                    setFormData({ ...formData, profilePicture: downloadURL });
                    setImageUploaded(false);
                });
            }
        )
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateUserFailure(null);
        setUpdateUserSuccess(null);
        if (Object.keys(formData).length === 0) {
            setUpdateUserFailure('No Changes Made');
            return;
        }
        if(imageUploaded){
            setUpdateUserFailure('Please wait for Image to upload');
            return;
        }
        try {
            dispatch(updateStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(updateFailure(data.message));
                setUpdateUserFailure(data.message);
            }else{
                dispatch(updateSuccess(data));
                setUpdateUserSuccess("User Profile Updated Successfully");
            }
        } catch (error) {
            dispatch(updateFailure(data.message));
            setUpdateUserFailure(data.message);
        }
    }

    const handleDeleteUser = async () => {
        setShowDeleteModal(false);

        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            }else{
                dispatch(deleteUserSuccess(data));
            }
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    }

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
        <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>

        <form className='flex flex-col gap-4' onSubmit={handleUpdate}>

            <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden/>

            <div className="relative w-32 h-32 self-center cursor-pointer shadow-lg overflow-hidden rounded-full" onClick={() => filePickerRef.current.click()}>
                {imageUploading && (
                    <CircularProgressbar 
                        value={imageUploading || 0} 
                        text={`${imageUploading}%`} 
                        strokeWidth={5} 
                        styles={{
                            root:{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            },
                            path: {
                                stroke: `rgba(62, 152, 199, ${imageUploading / 100})`,
                            }
                        }}
                    />
                )}
                <img src={imageFileUrl || currentUser.profilePicture} alt="User" className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageUploading && imageUploading < 100 && 'opacity-50'}`}/>
            </div>

            {imageUploadingError && <Alert color='failure'>{imageUploadingError}</Alert>}

            <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange} />
            <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email} onChange={handleChange} />
            <TextInput type='password' id='password' placeholder='Password' onChange={handleChange} />

            <Button type='submit' gradientDuoTone='purpleToBlue' outline>Update</Button>
        </form>

        <div className='text-red-500 flex justify-between mt-5'>
            <span className='cursor-pointer' onClick={() => setShowDeleteModal(true)}>Delete Account</span>
            <span className='cursor-pointer'>Sign Out</span>
        </div>

        {updateUserSuccess && (
            <Alert color='success' className='mt-5'>
                {updateUserSuccess}
            </Alert>
        )}

        {updateUserFailure && (
            <Alert color='failure' className='mt-5'>
                {updateUserFailure}
            </Alert>
        )}

        {error && (
            <Alert color='failure' className='mt-5'>
                {error}
            </Alert>
        )}

        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} popup size='md'>
            <Modal.Header   />
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                    <h3 className='mb-5 text-gray-400 dark:text-gray-200'>Are You Sure?</h3>
                    <div className='flex justify-center gap-4'>
                        <Button color='failure' onClick={handleDeleteUser}>Yes</Button>
                        <Button color='gray' onClick={() => setShowDeleteModal(false)}>No</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

    </div>
  )
}
