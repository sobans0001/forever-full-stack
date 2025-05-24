import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
    });

    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Fetch user info from backend using token
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.post(
                    import.meta.env.VITE_BACKEND_URL + '/api/user/profile',
                    {},
                    { headers: { token } }
                );
                if (response.data.success) {
                    setUserInfo({
                        fullName: response.data.user.name,
                        email: response.data.user.email,
                    });
                }
            } catch (error) {
                toast.error('Failed to fetch user info');
            }
        };
        fetchUser();
    }, []);

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords({ ...passwords, [name]: value });
    };

    // Show password popup
    const handlePasswordChange = () => {
        setShowPasswordPopup(true);
    };

    // Submit password change to backend
    const handlePasswordSubmit = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New Password and Confirm Password do not match.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                import.meta.env.VITE_BACKEND_URL + '/api/user/change-password',
                {
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Password changed successfully');
                setShowPasswordPopup(false);
                setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                toast.error(response.data.message || 'Password change failed');
            }
        } catch (error) {
            toast.error('Password change failed');
        }
    };

    const handleAccountDeletion = () => {
        // Placeholder for account deletion logic
        alert('Account deletion functionality not implemented yet.');
    };

    return (
        <div className="border-t pt-16">
            <div className="text-2xl">
                <Title text1={'MY'} text2={'PROFILE'} />
            </div>

            <div className="py-4 border-t border-b text-gray-700 space-y-6">
                {/* User Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">User Information</h2>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium">Full Name</label>
                            <p className="w-full px-4 py-2 border rounded bg-gray-100">{userInfo.fullName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email Address</label>
                            <p className="w-full px-4 py-2 border rounded bg-gray-100">{userInfo.email}</p>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">Account Settings</h2>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <button
                            onClick={handlePasswordChange}
                            className="border px-4 py-2 text-sm font-medium rounded-sm bg-black text-white"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Popup */}
            {showPasswordPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-lg font-medium mb-4">Change Password</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setShowPasswordPopup(false)}
                                className="px-4 py-2 text-sm font-medium rounded-sm bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                className="px-4 py-2 text-sm font-medium rounded-sm bg-black text-white"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
