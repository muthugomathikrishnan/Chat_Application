import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Groups.css'; // Import your CSS file for styles

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [hasFetched, setHasFetched] = useState(false); // Boolean to track fetch status
  const navigate = useNavigate(); // Initialize useNavigate
  const [showBox, setShowBox] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  

  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userData = getUserData();
  useEffect(() => {
    const fetchGroups = async () => {

      console.log("Fetching groups...");
      try {
        const response = await fetch(`http://10.16.49.195:5000/api/getGroups/${userData.id}`); // Correct template literal usage
                // Change user ID as necessary
        const data = await response.json();
        if (data.success) {
          console.log("Groups fetched successfully:", data.groups);
          setGroups(data.groups);
        } else {
          console.log("Failed to fetch groups:", data.message);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setHasFetched(true); // Set flag to true after fetch
      }
    };

    // Only fetch if not already fetched
    if (!hasFetched) {
      fetchGroups();
    }
  }, [hasFetched]); // Dependency array includes hasFetched

  // Handle group button click
  const handleUserClick = (groupId,groupName) => {
    localStorage.setItem('groupId', groupId);
    localStorage.setItem('groupName', groupName); // Store the selected group's ID in local storage
    navigate('/groupchat'); // Navigate to the Chat page
  };
  const handleClick = () => {
    setShowBox(true);
};

const handleClose = () => {
    setShowBox(false);
};

const handleCreate = async () => {
  const newGroup = {
      name: groupName,
      description: groupDescription,
      userId : userData.id
  };

  // Send data to the backend
  try {
      const response = await fetch('http://10.16.49.195:5000/create_group', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newGroup),
      });

      if (response.ok) {
          alert('Group created successfully!');
          setGroupName('');
          setGroupDescription('');
          handleClose();
      } else {
          alert('Error creating group');
      }
  } catch (error) {
      console.error('Error:', error);
  }
};

const handleJoin = async () => {
  const joinData = {
      code: groupCode,
      userId: userData.id
  };

  // Send data to the backend
  try {
      const response = await fetch('http://10.16.49.195:5000/join_group', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(joinData),
      });

      if (response.ok) {
          alert('Joined group successfully!');
          setGroupCode(''); // Clear the input field after joining
          handleClose(); // Close the modal or box
      } else {
          alert('Error joining group');
      }
  } catch (error) {
      console.error('Error:', error);
  }
};
  return (
    <div className="groups-container">
      <h1>Your Groups</h1>
      
      <div className="groups-list">
      {groups.map(group => (
        <button 
          key={group.group_id} 
          className="group-box" 
          onClick={() => handleUserClick(group.group_id,group.group_name)}
        >
          <div className="group-profile">
            {/* Assuming `group.profileImage` is the URL or path to the profile image */}
            <img src='https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg' alt={group.group_name} className="profile-image" />
          </div>
          <div className="group-name">
            {group.group_name}
          </div>
        </button>
      ))}
    </div>
     <button className="floating-button" onClick={handleClick}>
            +
        </button>
        {showBox && (
        <div className="temp-box">
            <div className="temp-box-header">
                <span>{isJoining ? 'Join Group' : 'Create Group'}</span>
                <button className="close-button" onClick={handleClose}>
                    &times;
                </button>
            </div>
            <div className="temp-box-body">
                {isJoining ? (
                    <label>
                        Group Code:
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => setGroupCode(e.target.value)}
                        />
                    </label>
                ) : (
                    <>
                        <label>
                            Group Name:
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </label>
                        <label>
                            Group Description:
                            <input
                                type="text"
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                            />
                        </label>
                    </>
                )}
            </div>
            <div className="temp-box-footer">
                <button onClick={isJoining ? handleJoin : handleCreate}>
                    {isJoining ? 'Join' : 'Create'}
                </button>
                <button onClick={() => setIsJoining(!isJoining)}>
                    {isJoining ? 'Create Group' : 'Join Group'}
                </button>
            </div>
        </div>
    )}

    </div>
    
  );
};

export default Groups;
