import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './friends.css';

export function Friends() {
    const [friends, setFriends] = useState(() => {
        const savedFriends = localStorage.getItem('friends');
        return savedFriends ? JSON.parse(savedFriends) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [newFriend, setNewFriend] = useState({name: '', contactInfo: '', contactType: 'mobile'});

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setNewFriend({name: '', contactInfo: ''});
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewFriend((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!newFriend.name.trim() || !newFriend.contactInfo.trim())
            return alert("Please fill in all fields.");

        const updateFriends = [
            ...friends,
            { 
                ...newFriend.name, 
                status: 'interested',
                contactInfo: [{ type: newFriend.contactType, value: newFriend.contactInfo }],
                hasCountedAsNewContact: false
            },
        ];

        setFriends(updateFriends);
        localStorage.setItem('friends', JSON.stringify(updateFriends));
        closeModal();
    };

    return (
        <main className="container">
            <table className="friends-table">
                <tbody>
                    {friends.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center text-muted">
                                No friends added yet.
                            </td>
                        </tr>
                    ) : (
                        friends.map((friend, index) => (
                            <tr key={index}>
                                <td><span className={`status-circle ${friend.status}`}></span></td>
                                <td><NavLink to={`/friend_info/${index}`}>{friend.name}</NavLink></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="add-friend-wrapper">
                <button className="btn btn-danger" onClick={openModal}>Add Friend</button>
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content p-3">
                            <div className="modal-header">
                                <h5 className="modal-title">Add a New Friend</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newFriend.name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter friend's name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contact Information</label>
                                    <div className="d-flex">
                                        <select
                                            name="contactType"
                                            value={newFriend.contactType}
                                            onChange={handleChange}
                                            className="form-control"
                                        >
                                            <option value="mobile">Mobile</option>
                                            <option value="social">Social Media</option>
                                            <option value="email">Email</option>
                                            <option value="address">Address</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input
                                            type="text"
                                            name="contactInfo"
                                            value={newFriend.contactInfo}
                                            onChange={handleChange}
                                            className="form-control me-2"
                                            placeholder="Enter contact info"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="add-btn" onClick={closeModal}>
                                Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleSave}>
                                Save Friend
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}