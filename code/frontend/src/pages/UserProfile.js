import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [updatedInfo, setUpdatedInfo] = useState({});

    useEffect(() => {
        const getUserData = () => {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        };

        const userData = getUserData();
        if (!userData) {
            console.error('No user data found in localStorage.');
            return;
        }

        const fetchUserProfile = async () => {
            const userId = userData.id;
            try {
                const response = await fetch(`http://10.16.49.195:5000/user/${userId}`);    
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(errorText);
                    return;
                }
                console.log("succ");
                const data = await response.json();
                setUser(data.user);
                setAdditionalInfo(data.additionalInfo || []); // Ensuring it's an array
            } catch (error) {
                console.error('An error occurred while fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleChange = (e) => {
        setUpdatedInfo({ ...updatedInfo, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        const userId = user.id;
        try {
            const response = await fetch(`http://10.16.49.195:5000/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedInfo),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser.user);
                setAdditionalInfo(updatedUser.additionalInfo || []);
                setEditMode(false);
            } else {
                console.error('Failed to update user profile');
            }
        } catch (error) {
            console.error('An error occurred while updating profile:', error);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-details">
                <div className="profile-item">
                    <label>ID:</label>
                    <span>{user.id}</span>
                </div>
                <div className="profile-item">
                    <label>Name:</label>
                    <span>{user.name}</span>
                </div>
                <div className="profile-item">
                    <label>Email:</label>
                    <span>{user.email}</span>
                </div>
                <div className="profile-item">
                    <label>Phone:</label>
                    <span>{user.phone}</span>
                </div>
                <div className="profile-item">
                    <label>Role:</label>
                    <span>{user.role}</span>
                </div>
                <div className="profile-item">
                    <label>Created At:</label>
                    <span>{new Date(user.created_at).toLocaleString()}</span>
                </div>
                <div className="profile-item">
                    <label>Updated At:</label>
                    <span>{new Date(user.updated_at).toLocaleString()}</span>
                </div>

                {/* Check if additionalInfo is an array and has elements */}
                {Array.isArray(additionalInfo) && additionalInfo.length > 0 && (
                    additionalInfo.map((info) => (
                        <div key={info.id}>
                            {user.role === 'staff' && (
                                <>
                                    <h2>Staff Details</h2>
                                    <div className="profile-item">
                                        <label>College:</label>
                                        <span>{info.college}</span>
                                    </div>
                                    <div className="profile-item">
                                        <label>Department:</label>
                                        <span>{info.department}</span>
                                    </div>
                                    <div className="profile-item">
                                        <label>College ID:</label>
                                        <span>{info.college_id}</span>
                                    </div>
                                    {editMode && (
                                        <>
                                            <div className="profile-item">
                                                <label>Office Location:</label>
                                                <input
                                                    type="text"
                                                    name="office_location"
                                                    defaultValue={info.office_location}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="profile-item">
                                                <label>Contact Hours:</label>
                                                <input
                                                    type="text"
                                                    name="contact_hours"
                                                    defaultValue={info.contact_hours}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            {user.role === 'student' && (
                                <>
                                    <h2>Student Details</h2>
                                    <div className="profile-item">
                                        <label>College:</label>
                                        <span>{info.college}</span>
                                    </div>
                                    <div className="profile-item">
                                        <label>Department:</label>
                                        <span>{info.department}</span>
                                    </div>
                                    <div className="profile-item">
                                        <label>College ID:</label>
                                        <span>{info.college_id}</span>
                                    </div>
                                    {editMode && (
                                        <>
                                            <div className="profile-item">
                                                <label>Year of Study:</label>
                                                <input
                                                    type="number"
                                                    name="year_of_study"
                                                    defaultValue={info.year_of_study}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}

                <div className="profile-actions">   
                    <button onClick={handleEditToggle}>
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                    {editMode && <button onClick={handleUpdate}>Save Changes</button>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
