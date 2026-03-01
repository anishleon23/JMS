import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Lock, User as UserIcon, Mail } from 'lucide-react';
import { updateUser, getUserByPhone } from '../services/db';

interface ProfileModalProps {
    user: { name: string, phone: string, email?: string, role?: UserRole };
    onClose: () => void;
    onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ text: "New passwords do not match", type: 'error' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ text: "Password is too short", type: 'error' });
            return;
        }

        // Verify current password logic 
        // Since we don't have the current user's password in the prop (for security), 
        // we fetch the full user object from DB to verify.
        const dbUser = await getUserByPhone(user.phone);

        if (!dbUser) {
            setMessage({ text: "User not found in database", type: 'error' });
            return;
        }

        // If user has no password set (e.g. old customer), currentPassword check might be skipped or handled specific way
        // But generally we expect a password if they are changing it.
        // If dbUser.password is undefined, they can set it without current password? 
        // Let's enforce current password if one exists.
        if (dbUser.password && dbUser.password !== currentPassword) {
            setMessage({ text: "Current password is incorrect", type: 'error' });
            return;
        }

        // Update
        const updatedUser = { ...dbUser, password: newPassword };
        await updateUser(updatedUser);

        setMessage({ text: "Password updated successfully!", type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <UserIcon size={20} /> My Profile
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-jms-red/10 text-jms-red rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-xl">{user.name}</h3>
                        <p className="text-gray-500">{user.phone}</p>
                        {user.email && (
                            <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
                                <Mail size={13} /> {user.email}
                            </p>
                        )}
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                            {user.role || 'Guest'}
                        </span>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">Change Password</h4>

                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full pl-9 p-2 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                                placeholder="Min 4 characters"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-jms-red focus:border-jms-red"
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-jms-red text-white font-bold py-2 rounded hover:bg-jms-dark transition">
                            Update Password
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t">
                        <button onClick={onLogout} className="w-full text-red-600 text-sm font-bold hover:underline">
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
