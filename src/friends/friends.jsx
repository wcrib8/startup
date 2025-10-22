import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './friends.css';

export function Friends() {
    const [friends, setFriends] = useState(() => {
        const savedFriends = localStorage.getItem('friends');
        return savedFriends ? JSON.parse(savedFriends) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [newFriend, setNewFriend] = useState({name: '', contact: ''});

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setNewFriend({name: '', contact: ''});
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewFriend((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!newFriend.name.trim() || !newFriend.contact.trim()) return alert("Please fill in all fields.");

        const updateFriends = [
            ...friends,
            { ...newFriend, status: 'interested' },
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
                                <td><NavLink to="/friend_info">{friend.name}</NavLink></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="add-friend-wrapper">
                <button className="btn btn-primary" onClick={openModal}>Add Friend</button>
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
                                    <label className="form-label">Contact</label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={newFriend.contact}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter contact info"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>
                                Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
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