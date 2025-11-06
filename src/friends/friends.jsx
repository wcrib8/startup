import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './friends.css';

export function Friends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newFriend, setNewFriend] = useState({
        name: '',
        contactInfo: '',
        contactType: 'mobile',
        availability: [],
        interests: [],
        progress: {
            discussions: 0,
            commitments: { notExtended: 0, extended: 0, keeping: 0, notKept: 0}
        },
        timeline: [],
        hasCountedAsNewContact: false
    });

    // load friends from backend
    useEffect(() => {
        async function loadFriends() {
            if (authState !== AuthState.Authenticated) {
                setFriends([]);
                setKeyIndicators([]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/friends', {
                    credentials: 'include', 
                });
                if (!res.ok) throw new Error('Failed to fetch friends');
                const data = await res.json();
                setFriends(data);
            } catch (err) {
                console.error('Error loading friends:', err);
                const saved = localStorage.getItem('friends');
                if (saved) setFriends(JSON.parse(saved));
            } finally {
                setLoading(false);
            }
        }

        loadFriends();
    }, [authState]);

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setNewFriend({name: '', contactInfo: ''});
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewFriend((prev) => ({ ...prev, [name]: value }));
    };

    // save friend with backend
    async function handleSave() {
        if (!newFriend.name.trim() || !newFriend.contactInfo.trim()) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const friendToAdd = {
                ...newFriend,
                contactInfo: [{ type: newFriend.contactType, value: newFriend.contactInfo }],
            };

            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(friendToAdd),
            });

            if (!res.ok) throw new Error('Failed to save friend');
            const updatedList = await res.json(); // backend can return full updated list

            setFriends(updatedList);
            localStorage.setItem('friends', JSON.stringify(updatedList)); // optional fallback
            closeModal();
        } catch (err) {
            console.error('Error saving friend:', err);
            alert('Could not save friend. Please try again.');
        }
    }

    const getStatusClass = (friend) => {
        if (!friend || !friend.timeline) return "interested";

        const dateCount = friend.timeline.filter(event => event.type === "date" || event.label?.toLowerCase().includes("date")).length;
        const kissCount = friend.timeline.filter(event => event.type === "kiss" || event.label?.toLowerCase().includes("kiss")).length;

        {console.log(friend.name, friend.timeline)}

        if (kissCount > 0 && dateCount >= 2) return "star";
        if (dateCount >= 2) return "progressing";
        return "interested";
    };

    if (loading) return <p>Loading friends</p>;

    return (
        <main className="container">
            <table className="friends-table">
                <tbody>
                    {friends.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center">
                                No friends added yet.
                            </td>
                        </tr>
                    ) : (
                        friends.map((friend, index) => (
                            <tr key={index}>
                                <td><span className={`status-circle ${getStatusClass(friend)}`}></span></td>
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