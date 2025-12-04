import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './friend_info.css';
import { AuthState } from '../login/auth_state';


export function Friend_info({ authState, userName, socket }) {
    console.log('authState in FriendInfo:', authState);
    console.log('userName in FriendInfo:', userName);

    const { id } = useParams();
    const navigate = useNavigate();

    const [showAddEvent, setShowAddEvent] = useState(false);
    const [eventType, setEventType] = useState('contact');
    const [contactMethod, setContactMethod] = useState('inPerson');
    const [selectedDiscussions, setSelectedDiscussions] = useState([]);
    const [selectedCommitments, setSelectedCommitments] = useState([]);
    const [vulnerableText, setVulnerableText] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0,16));
    const [otherDiscussion, setOtherDiscussion] = useState('');
    const [otherCommitment, setOtherCommitment] = useState('');
    
    const [showReferModal, setShowReferModal] = useState(false);
    const [referRecipient, setReferRecipient] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);

    const [friend, setFriend] = React.useState({
        hasCountedAsNewContact: false,
        hasCountedAsNewPartner: false
    });
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({
        name: '',
        contactInfo: [],
        availability: [],
        interests: [],
        progress: { discussions: 0, commitments: { notExtended: 0, extended: 0, keeping: 0, notKept: 0 } },
        timeline: [],
    });

    const updateKeyIndicators = async (types) => {
        try {
            // Make types always an array   
            const typesArray = Array.isArray(types) ? types : [types];
            
            const response = await fetch('/api/key_indicators', {
                credentials: 'include'
            });
            const stored = await response.json();

            let updated = stored.map(ind => {
                let increment = 0;
                
                typesArray.forEach(type => {
                    if (
                        (type === 'new_contact' && ind.label === 'New Contact') ||
                        (type === 'meaningful_conversation' && ind.label === 'Meaningful Conversation') ||
                        (type === 'date' && ind.label === 'Date') ||
                        (type === 'kiss' && ind.label === 'Kiss') ||
                        (type === 'vulnerable' && ind.label === 'Vulnerable Moment') ||
                        (type === 'new_partner' && ind.label === 'New Partner')
                    ) {
                        increment++;
                    }
                });
                
                if (increment > 0) {
                    return { ...ind, count: ind.count + increment };
                }
                return ind;
            });

            // Save to backend
            const saveResponse = await fetch('/api/key_indicators', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ indicators: updated })
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save indicators');
            }

            window.dispatchEvent(new Event('keyIndicatorsUpdated'));
            console.log(`Updated key indicators: ${typesArray.join(', ')}`);
        } catch (err) {
            console.error('Error saving indicators:', err);
        }
    };

    const loadFriend = async () => {
        try {
            const response = await fetch(`/api/friends/${id}`, { credentials: 'include' });
            const data = await response.json();
            
            if (!data) {
                navigate('/friends');
                return;
            }

            // const selectedFriend = data[friendIndex];
            setFriend(data);
            setEditData({
                name: data.name || '',
                contactInfo: data.contactInfo || [],
                availability: data.availability || [],
                interests: data.interests || [],
                progress: data.progress || { discussions: 0, commitments: { notExtended: 0, extended: 0, keeping: 0, notKept: 0 } },
                timeline: data.timeline || []
            });
        } catch (error) {
            console.error('Failed to load friends:', error);
        }
    };

    useEffect(() => {
        if (authState === AuthState.Unknown) return;
        if (authState !== AuthState.Authenticated) {
            navigate('/');
            return;
        }

        loadFriend();
    }, [id, navigate, authState]);


    const handleEditToggle = () => setIsEditing((prev) => !prev);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const updatedFriend = {
                ...friend,
                name: editData.name,
                contactInfo: editData.contactInfo,
                availability: editData.availability,
                interests: editData.interests
            };

            const response = await fetch(`/api/friends/${friend.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedFriend),
            });

            if (!response.ok) {
                throw new Error(`Failed to update friend: ${response.status}`);
            }  // added when fixing api call for friend info to update discussions etc.

            const savedFriend = await response.json();
            setFriend(savedFriend);
            setIsEditing(false);
            console.log('Friend saved to backend:', savedFriend);
        } catch (err) {
            console.error('Error saving friend:', err);
        }
    };


    if (!friend) return <main className="container">Loading...</main>;

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...editData.contactInfo];
        updatedContacts[index][field] = value;
        setEditData(prev => ({ ...prev, contactInfo: updatedContacts }));
    };

    const removeContact = (index) => {
        const updatedContacts = editData.contactInfo.filter((_, i) => i !== index);
        setEditData(prev => ({ ...prev, contactInfo: updatedContacts }));
    };

    function handleAddContact(newContact) {
        setFriend(prev => {
            const updatedContacts = [...prev.contactInfo, newContact];
            const updatedFriend = { ...prev, contactInfo: updatedContacts };

            return updatedFriend;
        });
    }


    const addContact = (newContact) => {
        setEditData(prev => ({
            ...prev,
            contactInfo: [...prev.contactInfo, { type: 'mobile', value: '' }]

        }));
    };

    const handleArrayChange = (field, index, key, value) => {
        const updated = [...editData[field]];
        if (key) updated[index][key] = value;
        else updated[index] = value;
        setEditData(prev => ({ ...prev, [field]: updated }));
    };

    const removeItem = (field, index) => {
        setEditData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const calculateProgress = (timeline) => {
        const discussionsSet = new Set();
        const commitmentsSet = new Set();

        timeline.forEach(event => {
            (event.discussions || []).forEach(d => discussionsSet.add(d));
            (event.commitments || []).forEach(c => commitmentsSet.add(c));
        });

        return {
            discussions: discussionsSet.size,
            commitments: {
                extended: commitmentsSet.size,
                notExtended: 0,
                keeping: 0,
                notKept: 0
            }
        };
    };

    const handleRefer = async (recipientEmail) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            alert('WebSocket not connected. Please refresh the page and try again.');
            return;
        }

        if (!recipientEmail || recipientEmail.trim() === '') {
            alert('Referral cancelled - no username provided.');
            return;
        }

        const referralData = {
            type: 'friend_referral',
            toUser: recipientEmail.trim(),
            fromUser: userName,
            originalFriendId: friend.id,
            friend: { 
                name: friend.name,
                contactInfo: friend.contactInfo,
                availability: friend.availability,
                interests: friend.interests,
                timeline: friend.timeline || [],
                progress: friend.progress || { discussions: 0, commitments: { notExtended: 0, extended: 0, keeping: 0, notKept: 0 } }
            } 
        };

        socket.send(JSON.stringify(referralData));
        console.log('Sent referral via WebSocket:', referralData);

        try {
            const response = await fetch(`/api/friends/${friend.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Friend deleted after referral');
                alert(`Friend "${friend.name}" referred and deleted from your list.`);
                navigate('/friends');
            } else {
                console.error('Failed to delete friend after referral');
                alert('Failed to delete friend after referral.');
            }
        } catch (err) {
            console.error('Error deleting friend:', err);
            alert('Error deleting friend after referral.');
        }
    };


    const updateProgressBar = (friendData) => {
        // Collect discussions and commitments from timeline
        const completedDiscussions = new Set();
        const completedCommitments = new Set();

        friendData.timeline.forEach(event => {
            event.discussions?.forEach(d => {
                if (d.toLowerCase() !== "other") completedDiscussions.add(d.toLowerCase());
            });
            event.commitments?.forEach(c => {
                if (c.toLowerCase() !== "other") completedCommitments.add(c.toLowerCase());
            });
        });

        // Total possible from available options
        const totalDiscussions = discussionOptions.filter(d => d.toLowerCase() !== "other").length;
        const totalCommitments = commitmentOptions.filter(c => c.toLowerCase() !== "other").length;

        const totalCompleted = completedDiscussions.size + completedCommitments.size;
        const totalPossible = totalDiscussions + totalCommitments;

        const progressPercent = totalPossible === 0
            ? 0
            : Math.floor((totalCompleted / totalPossible) * 100);

        return progressPercent;
    };

    const handleAddEvent = async () => {
        const newEvent = {
            label: eventType,
            date: eventDate,
            discussions: [
                ...selectedDiscussions.filter(d => d !== 'other'),
                ...(otherDiscussion ? [otherDiscussion] : [])
            ],
            commitments: [
                ...selectedCommitments.filter(c => c !== 'other'),
                ...(otherCommitment ? [otherCommitment] : [])
            ],
            extraText: eventType === 'vulnerable' ? vulnerableText : '',
            contactMethod: eventType === 'contact' ? contactMethod : null
        };

        // Check for new partner commitment
        const isNewPartnerCommitment = selectedCommitments.some(c =>
            c.toLowerCase().includes('girlfriend') || c.toLowerCase().includes('boyfriend')
        );

        const indicatorsToUpdate = [];
        const updatedTimeline = [...(friend.timeline || []), newEvent];
        const updatedProgress = calculateProgress(updatedTimeline);
        const progressPercent = updateProgressBar({
            ...friend,
            timeline: updatedTimeline,
            progress: updatedProgress
        });

        const updatedFriend = {
            ...friend,
            timeline: updatedTimeline,
            progress: updatedProgress,
            progressPercent: progressPercent
        };

        // Determine which indicators to update
        if (isNewPartnerCommitment && !friend.hasCountedAsNewPartner) {
            indicatorsToUpdate.push('new_partner');
            updatedFriend.hasCountedAsNewPartner = true;
        }

        if (eventType === 'contact' && !friend.hasCountedAsNewContact && ['inPerson', 'call', 'text', 'social'].includes(contactMethod)) {
            indicatorsToUpdate.push('new_contact');
            updatedFriend.hasCountedAsNewContact = true;
        } else if (eventType === 'conversation' && selectedDiscussions.length > 0) {
            indicatorsToUpdate.push('meaningful_conversation');
        } else if (eventType === 'date') {
            indicatorsToUpdate.push('date');
        } else if (eventType === 'kiss') {
            indicatorsToUpdate.push('kiss');
        } else if (eventType === 'vulnerable') {
            indicatorsToUpdate.push('vulnerable');
        }

        // Update state
        setFriend(updatedFriend);
        setEditData(prev => ({
            ...prev,
            timeline: updatedTimeline,
            progress: updatedProgress,
            progressPercent: progressPercent,
        }));

        // Save friend to backend
        try {
            await fetch(`/api/friends/${updatedFriend.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedFriend),
            });
        } catch (err) {
            console.error("Failed to save friend event:", err);
        }

        // Update all indicators in one call
        if (indicatorsToUpdate.length > 0) {
            await updateKeyIndicators(indicatorsToUpdate);
        }

        window.dispatchEvent(new Event('keyIndicatorsUpdated'));

        setShowAddEvent(false);
        setEventType('');
        setContactMethod('');
        setSelectedDiscussions([]);
        setSelectedCommitments([]);
        setVulnerableText('');
        setOtherDiscussion('');
        setOtherCommitment('');
        setEventDate(new Date().toISOString().slice(0, 16));
    };




    const discussionOptions = [
        'family', 'background', 'goals', 'core values', 
        'philosophy and religion', 'past experiences', 
        'emotions', 'fears', 'romantic feelings', 'other'
    ];

    const commitmentOptions = [
        'stay in contact', 'regular kind communication', 'go on a date', 
        'meet friends', 'attend an activity together', 'daily call', 
        'be present at something important', 
        '(name) is present at something important to you', 
        'kiss', 'share vulnerable moment', 'be girlfriend or boyfriend', 'other'
    ];


    const totalDiscussionsDone = editData.timeline.reduce((sum, event) => sum + (event.discussions?.length || 0), 0);
    const totalPossibleDiscussions = editData.timeline.reduce((sum, event) => sum + (discussionOptions?.length || 0), 0);
    const totalCommitmentsDone = editData.timeline.reduce((sum, event) => sum + (event.commitments?.length || 0), 0);
    const totalPossibleCommitments = editData.timeline.reduce((sum, event) => sum + (commitmentOptions?.length || 0), 0);

    const progressPercent = Math.floor(
        (totalDiscussionsDone + totalCommitmentsDone) / 
        (totalPossibleDiscussions + totalPossibleCommitments) * 100
    );



    return (
        <main className="container">
            <section className="friend-section">
                <h2>{friend.name}</h2>

                {isEditing ? (
                    <>
                        <div className="friend-box mb-3">
                            <label>Name:</label>
                            <input
                                className="form-control"
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="friend-box">
                            <h5>Contact Information</h5>
                            {editData.contactInfo.map((info, index) => (
                                <div key={index} className="contact-entry d-flex align-items-center mb-2">
                                    <select
                                        name="type"
                                        value={info.type}
                                        onChange={(e) => handleContactChange(index, 'type', e.target.value)}
                                        className="form-control me-2"
                                    >
                                        <option value="mobile">Mobile</option>
                                        <option value="social">Social Media</option>
                                        <option value="email">Email</option>
                                        <option value="address">Address</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="value"
                                        value={info.value}
                                        onChange={(e) => handleContactChange(index, 'value', e.target.value)}
                                        className="form-control me-2"
                                        placeholder="Enter contact info"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeContact(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="add-btn" onClick={addContact}>+ Add Contact Info</button>
                        </div>

                        <div className="friend-box">
                            <h5>Progress</h5>

                            <div className="contact-entry d-flex align-items-center mb-2">
                                <label className="me-2">Discussions:</label>
                                <span>{friend.progress?.discussions || 0}</span>
                            </div>

                            {(() => {
                                const allDiscussions = editData.timeline?.flatMap(event => event.discussions || []) || [];
                                const uniqueDiscussions = [...new Set(allDiscussions)];
                                return uniqueDiscussions.length > 0 ? (
                                    <ul>
                                        {uniqueDiscussions.map((d, i) => (
                                            <li key={`discussion-${i}`}>{d}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted small">No discussions yet</p>
                                );
                            })()}

                            <div className="contact-entry mt-3">
                                <label>Commitments:</label>
                                {Object.entries(editData.progress.commitments).map(([key, value]) => (
                                    <div key={key} className="d-flex align-items-center mb-1">
                                        <span className="me-2" style={{ textTransform: 'capitalize' }}>{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>

                            {(() => {
                                const allCommitments = editData.timeline?.flatMap(event => event.commitments || []) || [];
                                const uniqueCommitments = [...new Set(allCommitments)];
                                return uniqueCommitments.length > 0 ? (
                                    <ul>
                                        {uniqueCommitments.map((c, i) => (
                                            <li key={`commitment-${i}`}>{c}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted small">No commitments yet</p>
                                );
                            })()}
                        </div>

                        <div className="friend-box">
                            <h5>Availability</h5>
                            {editData.availability.map((slot, i) => (
                                <div key={i} className="contact-entry d-flex align-items-center mb-2">
                                    <input
                                        type="text"
                                        value={slot}
                                        onChange={(e) => handleArrayChange('availability', i, null, e.target.value)}
                                        className="form-control me-2"
                                        placeholder="e.g., Monday 2pm - 5pm"
                                    />
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem('availability', i)}>Remove</button>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                className="add-btn" 
                                onClick={() =>
                                    setEditData(prev => ({
                                        ...prev,
                                        availability: [...prev.availability, '']
                                    }))
                                }
                            >
                                + Add Availability
                            </button>
                        </div>

                        <div className="friend-box">
                            <h5>Interests</h5>
                            {editData.interests.map((interest, i) => (
                                <div key={i} className="contact-entry d-flex align-items-center mb-2">
                                    <input
                                        type="text"
                                        value={interest}
                                        onChange={(e) => handleArrayChange('interests', i, null, e.target.value)}
                                        className="form-control me-2"
                                        placeholder="Interest"
                                    />
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem('interests', i)}>Remove</button>
                                </div>
                            ))}
                            <button type="button" className="add-btn" onClick={() => setEditData(prev => ({...prev, interests: [...prev.interests, '']}))}>+ Add Interest</button>
                        </div>

                        <div className="friend-box">
                            <h5>Timeline</h5>
                            {editData.timeline.length > 0 ? (
                                <ul>
                                    {editData.timeline.map((event, i) => (
                                        <li key={i} className="mb-2">
                                            <strong>{event.label}</strong> — {event.date}
                                            {event.extraText && <div><em>{event.extraText}</em></div>}

                                            {event.discussions?.length > 0 && (
                                                <div>
                                                    <strong>Discussions:</strong>
                                                    <ul>
                                                        {event.discussions.map((d, j) => (
                                                            <li key={j}>{d}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {event.commitments?.length > 0 && (
                                                <div>
                                                    <strong>Commitments:</strong>
                                                    <ul>
                                                        {event.commitments.map((c, j) => (
                                                            <li key={j}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="d-flex gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={event.label}
                                                    onChange={(e) => handleArrayChange('timeline', i, 'label', e.target.value)}
                                                    className="form-control me-2"
                                                />
                                                <input
                                                    type="datetime-local"
                                                    value={event.date}
                                                    onChange={(e) => handleArrayChange('timeline', i, 'date', e.target.value)}
                                                    className="form-control me-2"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeItem('timeline', i)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No timeline events yet</p>
                            )}
                        </div>

                        <button className="btn btn-danger btn-sm" onClick={handleSave}>Save</button>
                        <button className="add-btn" onClick={handleEditToggle}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div className="friend-box">
                            <h5>Contact Information</h5>
                            <ul>
                                {friend.contactInfo?.length > 0 ? (
                                    friend.contactInfo.map((c, i) => (
                                        <li key={i}><strong>{c.type}:</strong> {c.value}</li>
                                    ))
                                ) : (
                                    <li>No contact info yet</li>
                                )}
                            </ul>
                        </div>

                        <div className="progress-wrapper d-flex align-items-center">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${friend.progressPercent || 0}%` }}
                                ></div>
                            </div>
                            <span className="heart-icon">❤️</span>
                        </div>


                        <div className="friend-box">
                            <h5>Progress</h5>
                            <ul>
                                <li><strong>Discussions:</strong> {friend.progress?.discussions || 0}</li>
                                {friend.progress?.commitments && (
                                    <li>
                                        <strong>Commitments:</strong>{" "}
                                        {Object.entries(friend.progress.commitments)
                                            .map(([k, v]) => `${v} ${k}`)
                                            .join(", ")}
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="friend-box">
                            <h5>Availability</h5>
                            <ul>
                                {friend.availability?.length > 0 ? (
                                    friend.availability.map((a, i) => (
                                        <li key={i}>{a}</li>
                                    ))
                                ) : (
                                    <li>No availability info yet</li>
                                )}
                            </ul>
                        </div>

                        <div className="friend-box">
                            <h5>Interests</h5>
                            <ul>
                                {friend.interests?.length > 0 ? (
                                    friend.interests.map((iName, i) => <li key={i}>{iName}</li>)
                                ) : (
                                    <li>No interests added</li>
                                )}
                            </ul>
                        </div>

                        <div className="friend-box">
                            <h5>Timeline</h5>
                            <ul>
                                {friend.timeline?.length > 0 ? (
                                    friend.timeline.map((event, i) => (
                                        <li key={i}><strong>{event.label}:</strong> {event.date}</li>
                                    ))
                                ) : (
                                    <li>No timeline events</li>
                                )}
                            </ul>
                        </div>

                        <button className="add-btn" onClick={handleEditToggle}>✎ Edit</button>
                    </>
                )}

                {!isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button className="btn btn-danger" onClick={() => setShowAddEvent(true)}>
                            + Add Event
                        </button>
                        <button className="btn btn-danger" onClick={() => setShowReferModal(true)}>
                            Refer
                        </button>
                    </div>
                )}
            </section>

            {showAddEvent && (
                <div className="add-event-modal">
                    <h5>Add Event</h5>
                    <select value={eventType} onChange={e => setEventType(e.target.value)}>
                        <option value="contact">Contact</option>
                        <option value="conversation">Meaningful Conversation</option>
                        <option value="date">Date</option>
                        <option value="kiss">Kiss</option>
                        <option value="vulnerable">Vulnerable Moment</option>
                    </select>

                    {eventType === 'contact' && (
                        <select value={contactMethod} onChange={e => setContactMethod(e.target.value)}>
                            <option value="inPerson">In Person</option>
                            <option value="call">Call</option>
                            <option value="text">Text</option>
                            <option value="social">Social Media</option>
                        </select>
                    )}

                    {(eventType === 'conversation' || eventType === 'contact' || eventType === 'date' || eventType === 'vulnerable') && (
                        <>
                            <div className="checkbox-group">
                                <h6>Discussions:</h6>
                                {discussionOptions.map((d, i) => (
                                    <label key={i} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedDiscussions.includes(d)}
                                            onChange={e => 
                                                setSelectedDiscussions(prev =>
                                                    e.target.checked ? [...prev, d] : prev.filter(item => item !== d)
                                                )
                                            }  
                                        />
                                        <span>{d}</span>
                                    </label>
                                ))}

                                {selectedDiscussions.includes('other') && (
                                    <input
                                        type="text"
                                        className="form-control mt-2 bright-placeholder"
                                        placeholder="Enter custom discussion topic"
                                        value={otherDiscussion}
                                        onChange={e => setOtherDiscussion(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="checkbox-group">
                                <h6>Commitments:</h6>
                                {commitmentOptions.map((c, i) => (
                                    <label key={i} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedCommitments.includes(c)}
                                            onChange={e => 
                                                setSelectedCommitments(prev => 
                                                    e.target.checked ? [...prev, c] : prev.filter(item => item !== c)
                                                )
                                            }
                                        />
                                        <span>{c}</span>
                                    </label>
                                ))}

                                {selectedCommitments.includes('other') && (
                                    <input
                                        type="text"
                                        className="form-control mt-2 bright-placeholder"
                                        placeholder="Enter custom commitment"
                                        value={otherCommitment}
                                        onChange={e => setOtherCommitment(e.target.value)}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {eventType === 'vulnerable' && (
                    <textarea 
                        placeholder="Describe the vulnerable moment" 
                        value={vulnerableText} 
                        className="form-control mt-2 bright-placeholder"
                        onChange={e => setVulnerableText(e.target.value)}
                    />
                    )}

                    <input className="form-control" type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                    <div>
                        <button className="btn btn-danger" onClick={handleAddEvent}>Add Event</button>
                        <button className="add-btn" onClick={() => setShowAddEvent(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {showReferModal && (
                <div className="add-event-modal">
                    <h5>Refer Friend</h5>
                    <input 
                        type="text"
                        className="form-control bright-placeholder"
                        placeholder="Enter recipient's email"
                        value={referRecipient}
                        onChange={e => setReferRecipient(e.target.value)}
                    />
                    <div>
                        <button className="btn btn-danger" onClick={() => {
                            if (referRecipient.trim()) {
                                handleRefer(referRecipient.trim());
                                setShowReferModal(false);
                                setReferRecipient('');
                            } else {
                                alert('Please enter a valid email for the recipient.');
                            }
                        }}>
                            Send Referral
                        </button>
                        <button className="add-btn" onClick={() => {
                            setShowReferModal(false);
                            setReferRecipient('');
                        }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
