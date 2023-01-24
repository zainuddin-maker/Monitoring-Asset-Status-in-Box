// System library imports
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { encode } from "js-base64";

// Custom library imports
import {
    InputTextVertical,
    InputEmailVertical,
    InputPasswordVertical,
    ButtonSubmit,
    ButtonClear,
    LoadingData,
    useModal,
    PreviewImage,
} from "../../ComponentReuseable/index";

import { getToken, getUserDetails } from "../../TokenParse/TokenParse";

import Image_update_profile from "../../../svg/profile_empty.svg";
// Image imports
import update_profile from "../../../svg/profile_empty.svg";
import updateProfilePicIcon from "../../../svg/update_profile_pic_icon.svg";
import SVG_preview from "../../../svg/preview.svg";
import SVG_Trash from "../../../svg/trash.svg";
import SVG_Blank_Image_White from "../../../svg/blank_image_white.svg";

import { ReturnHostBackend } from "../../BackendHost/BackendHost";

// Style imports
import "./style.scss";

const UpdateProfile = () => {
    // States
    const [initialData, setInitialData] = useState({
        profilePic: null,
        fullname: "",
        email: "",
        phoneNumber: "",
    });

    const [updateProfileForm, setUpdateProfileForm] = useState({
        profilePic: null,
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();

    // Functions
    // Handle profile pic upload
    const handleProfilePicUpload = (e) => {
        let { files } = e.target;

        if (files.length > 0) {
            let file = e.target.files[0];

            const reader = new FileReader();

            reader.addEventListener(
                "load",
                () => {
                    // Set the uploaded image file to the state
                    setUpdateProfileForm((prevState) => {
                        return { ...prevState, profilePic: file };
                    });

                    // Set the displayed profile pic to the uploaded file
                    setProfilePicUrl(reader.result);
                },
                false
            );

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    };

    // Handle text input change
    const handleChange = (e) => {
        let { name, value } = e.target;
        setUpdateProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const validateNewPassword = (password) => {
        let regex =
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?([^\w\s]|[_])).{8,72}$/;
        return regex.test(password);
    };
    const onSave = async (e) => {
        e.preventDefault();
        // Set isLoading to TRUE
        setIsLoading(true);

        let newPassword = null;
        if (updateProfileForm.newPassword !== "") {
            if (
                validateNewPassword(updateProfileForm.newPassword) &&
                updateProfileForm.confirmNewPassword !==
                    updateProfileForm.newPassword
            ) {
                toast.error("Incorrect confirm password");
                setIsLoading(false);
                return;
            } else if (validateNewPassword(updateProfileForm.newPassword)) {
                newPassword = updateProfileForm.newPassword;
            } else {
                toast.error(
                    "Password length min. 8 max.72, contain at least 1 uppercase, lowercase, numeric, and special character"
                );
                setIsLoading(false);
                return;
            }
        }

        // console.log(profilePicUrl);
        // console.log(profilePicUrl ? false : true);
        // console.log(getUserDetails().userId);
        // console.log(updateProfileForm.password);
        // console.log(updateProfileForm.fullname);
        // console.log(updateProfileForm.phoneNumber);
        // console.log(updateProfileForm.email);
        // console.log(newPassword);
        // console.log(updateProfileForm.profilePic);
        const formData = new FormData();
        formData.append("isRemoveImage", profilePicUrl ? false : true);
        formData.append("user_id", getUserDetails().userId);
        formData.append("old_password", updateProfileForm.password);
        formData.append("fullname", updateProfileForm.fullname);
        formData.append("phone_number", updateProfileForm.phoneNumber);
        formData.append("email", updateProfileForm.email);
        if (newPassword) {
            formData.append("new_password", newPassword);
        }
        if (updateProfileForm.profilePic) {
            formData.append("file", updateProfileForm.profilePic);
        }

        const token = getToken();
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                process.env.REACT_APP_EDIT_PROFILE,
            data: formData,
            headers: {
                authorization: token,
            },
            // withCredentials: true,
        };
        try {
            let response = await axios(config);
            // console.log(response);
            toast.success("Successfully update profile");
            setIsLoading(false);
            getCurrentUserDetails();
        } catch (err) {
            if (err.response) {
                toast.error(err.response.data.toString());
            } else {
                toast.error(err.toString());
            }
            setIsLoading(false);
        }
    };

    const onClear = (e) => {
        e.preventDefault();

        // Empty the updateProfileForm state
        setUpdateProfileForm({
            profilePic: null,
            fullname: initialData.fullname,
            email: initialData.email,
            phoneNumber: initialData.phoneNumber,
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        });

        // Set the previewed profile pic to the old image (if any)
        setProfilePicUrl(initialData.profilePic);
    };

    // Get current user profile data
    const getCurrentUserDetails = async () => {
        setIsLoadingData(true);
        const user_id = getUserDetails().userId;
        const config = {
            method: "get",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                `${process.env.REACT_APP_GET_PROFILE_DETAILS}/${user_id}`,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const response = await axios(config);
            if (response.data) {
                let { fullname, email, phone_number, image } = response.data;
                setInitialData({
                    profilePic: image
                        ? ReturnHostBackend(
                              process.env.REACT_APP_BACKEND_NODELINX
                          ) +
                          image +
                          "?" +
                          Date.now()
                        : null,
                    fullname: fullname,
                    email: email,
                    phoneNumber: phone_number,
                });

                setUpdateProfileForm({
                    profilePic: null,
                    fullname: fullname,
                    email: email,
                    phoneNumber: phone_number,
                    password: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });

                // Initialize the profile pic
                setProfilePicUrl(
                    image
                        ? ReturnHostBackend(
                              process.env.REACT_APP_BACKEND_NODELINX
                          ) +
                              image +
                              "?" +
                              Date.now()
                        : null
                );

                const updateUserDetailsLocalStorage = {
                    ...getUserDetails(),
                    image: image + "?" + Date.now(),
                };

                localStorage.setItem(
                    "user_details",
                    encode(JSON.stringify(updateUserDetailsLocalStorage))
                );
            } else {
                setInitialData({
                    profilePic: null,
                    fullname: "",
                    email: "",
                    phoneNumber: "",
                });

                setUpdateProfileForm({
                    profilePic: null,
                    fullname: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
                setProfilePicUrl(null);

                toast.error("Failed to get user details");
            }
            setIsLoadingData(false);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data);
            } else {
                toast.error("Failed to get user data");
            }
            setInitialData({
                profilePic: null,
                fullname: "",
                email: "",
                phoneNumber: "",
            });

            setUpdateProfileForm({
                profilePic: null,
                fullname: "",
                email: "",
                phoneNumber: "",
                password: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setProfilePicUrl(null);
            setIsLoadingData(false);
            // console.log(err);
        }
    };

    // Side-effects
    // Get current user profile data at component load
    useEffect(() => {
        getCurrentUserDetails();
    }, []);

    return (
        <div className='update-profile__container'>
            <PreviewImage
                src={profilePicUrl}
                isShowing={isShowingPreview}
                hide={togglePreview}
            />
            <div className='update-profile'>
                <div className='update-profile__title'>
                    <span>Edit Profile</span>
                </div>
                <div className='update-profile__content'>
                    <form
                        id='update-profile-form'
                        onSubmit={onSave}
                        style={{ position: "relative" }}>
                        <LoadingData isLoading={isLoadingData} />
                        <div className='update-profile-form__profile-picture'>
                            <div className='update-profile-form__profile-picture__pic'>
                                <div className='update-profile-image'>
                                    <img
                                        src={
                                            profilePicUrl === null
                                                ? Image_update_profile
                                                : profilePicUrl
                                        }
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = update_profile;
                                        }}
                                        alt='profile'
                                    />
                                </div>
                                {profilePicUrl !== null && (
                                    <div className='update-profile-preview'>
                                        <div onClick={togglePreview}>
                                            <img
                                                src={SVG_preview}
                                                alt='preview'
                                            />
                                        </div>
                                        <div
                                            onClick={() =>
                                                setProfilePicUrl(null)
                                            }>
                                            <img
                                                src={SVG_Trash}
                                                alt='preview'
                                            />
                                        </div>
                                    </div>
                                )}
                                <label htmlFor='profile-pic'>
                                    <img
                                        className='update-profile-form__profile-picture__icon'
                                        src={updateProfilePicIcon}
                                        alt='update-profile-pic-icon'
                                    />
                                </label>
                                <input
                                    type='file'
                                    id='profile-pic'
                                    name='profile-pic'
                                    accept='image/*'
                                    onChange={handleProfilePicUpload}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>
                        <div className='update-profile-form__user-info'>
                            <div className='update-profile-form__user-info__column'>
                                <InputTextVertical
                                    width='100%'
                                    name='fullname'
                                    label='Full Name'
                                    value={updateProfileForm.fullname}
                                    onChange={handleChange}
                                    isRequired={false}
                                />
                                <InputEmailVertical
                                    width='100%'
                                    name='email'
                                    label='Email'
                                    value={updateProfileForm.email}
                                    onChange={handleChange}
                                    isRequired={false}
                                />
                                <InputTextVertical
                                    width='100%'
                                    name='phoneNumber'
                                    label='Phone Number'
                                    value={updateProfileForm.phoneNumber}
                                    onChange={handleChange}
                                    isRequired={false}
                                />
                            </div>
                            <div className='update-profile-form__user-info__column'>
                                <InputPasswordVertical
                                    width='100%'
                                    name='password'
                                    label='Password'
                                    value={updateProfileForm.password}
                                    onChange={handleChange}
                                    isRequired={true}
                                />
                                <InputPasswordVertical
                                    width='100%'
                                    name='newPassword'
                                    label='New Password'
                                    value={updateProfileForm.newPassword}
                                    onChange={handleChange}
                                    isRequired={false}
                                />
                                <InputPasswordVertical
                                    width='100%'
                                    name='confirmNewPassword'
                                    label='Confirm New Password'
                                    value={updateProfileForm.confirmNewPassword}
                                    onChange={handleChange}
                                    isRequired={
                                        updateProfileForm.newPassword
                                            ? true
                                            : false
                                    }
                                />
                            </div>
                        </div>
                    </form>
                    <div className='update-profile-required'>*Required</div>
                </div>
                <div className='update-profile__button-container'>
                    <ButtonSubmit
                        name={"Save"}
                        formId={"update-profile-form"}
                        isLoading={isLoading}
                    />
                    <ButtonClear name={"Clear"} onClear={onClear} />
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;
