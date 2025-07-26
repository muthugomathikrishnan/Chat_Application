import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import './GroupDetails.css'; // Uncomment if you have a CSS file for styles

function GroupDetails() {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Default to false
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Default visibility is false
  const [adminOnlyMessages, setAdminOnlyMessages] = useState(false); // Default to false

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); // Parse query string
  const groupId = queryParams.get('groupId'); // Get groupId from query params
  const userId = queryParams.get('userId'); // Get userId from query params
  
  // Fetch group details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`http://10.16.49.195:5000/group/${groupId}`);
        const data = await response.json();

        if (data) {
          console.log(data.group.group_name)
          setGroupName(data.group.group_name);
          setGroupDescription(data.group.group_description);
          setMembers(data.members);
          setIsVisible(data.visibility || false); // Ensure default false if not set
          setAdminOnlyMessages(data.admin_only_messages || false);
          setCode(data.group.code) // Default to false if not set
        }
        console.log(groupName);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // Check if the user is an admin of the group
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) return; // Don't fetch if userId is not set

      try {
        const response = await fetch(`http://10.16.49.195:5000/group/${groupId}/isAdmin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin status');
        }

        const data = await response.json();
        setIsAdmin(data.isAdmin || false); // Default to false if not set
      } catch (err) {
        setError(err.message);
      }
    };

    checkAdminStatus();
  }, [groupId, userId]);

  // Add a member to the group
  const addMember = async () => {
    if (email) {
      try {
        const response = await fetch(`http://10.16.49.195:5000/group/${groupId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, isAdmin }), // Send email instead of userId
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message); // Show error message
          return;
        }

        const data = await response.json();
        setMembers((prevMembers) => [...prevMembers, data]); // Add new member to the list
        setEmail(''); // Clear the input after adding
      } catch (error) {
        console.error('Error adding member:', error);
      }
    }
  };

  // Remove a member from the group
  const removeMember = async (memberId) => {
    try {
      const response = await fetch(`http://10.16.49.195:5000/group/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message); // Show error message if remove fails
        return;
      }

      setMembers(members.filter((member) => member.group_member_id !== memberId)); // Remove member from the list
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  // Toggle group visibility (only for admins)
  const toggleVisibility = async () => {
    if (!isAdmin) return; // Only admins can toggle visibility

    const newVisibility = !isVisible;
    try {
      const response = await fetch(`http://10.16.49.195:5000/group/${groupId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ isVisible: newVisibility }),
      });

      if (response.ok) {
        setIsVisible(newVisibility);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  // Toggle admin-only messages (only for admins)
  const toggleAdminOnlyMessages = async () => {
    if (!isAdmin) return; // Only admins can toggle

    const newAdminOnly = !adminOnlyMessages;
    try {
      const response = await fetch(`http://10.16.49.195:5000/group/${groupId}/adminOnlyMessages`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ adminOnlyMessages: newAdminOnly }),
      });

      if (response.ok) {
        setAdminOnlyMessages(newAdminOnly);
      }
    } catch (error) {
      console.error('Error toggling admin-only messages:', error);
    }
  };

  if (loading) {
    return <p>Loading group details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="group-details">
      <h1>{groupName}</h1>

      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter member's email"
        />
        <button onClick={addMember}>Add Member</button>
      </div>

      <h2>Members:</h2>
      <ul>
        {members.map((member) => (
          <li key={member.group_member_id}>
            {member.name} ({member.email})
            {isAdmin && (
              <button onClick={() => removeMember(member.group_member_id)}>Remove</button>
            )}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="toggle-buttons">
          <h1>{code}</h1>
          <div className="toggle">
            <label>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={toggleVisibility}
              />
              <span>Group Visibility</span>
            </label>
          </div>
          <div className="toggle">
            <label>
              <input
                type="checkbox"
                checked={adminOnlyMessages}
                onChange={toggleAdminOnlyMessages}
              />
              <span>Admin-Only Messages</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetails;
