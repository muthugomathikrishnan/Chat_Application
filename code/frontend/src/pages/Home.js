import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 
import ChatGraph from "./ChatGraph"; 

const Home = ({ isAuthenticated }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [chatUsers, setChatUsers] = useState([]);
    const [userFnds, setUserFnds] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "" });
    const [emailRange, setEmailRange] = useState({ start: "", end: "" }); 
    const [activeChats, setActiveChats] = useState([]);
    const navigate = useNavigate();

    const getUserData = () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null; 
    };

    const fetchUserFnds = async () => {
        const userData = getUserData();
        if (userData && userData.id) {
            try {
                const response = await fetch(
                    `http://10.16.49.195:5000/api/getUserFnds/${userData.id}`,
                );
                if (!response.ok)
                    throw new Error("Failed to fetch user friends");
                const data = await response.json();
                setUserFnds(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const fetchActiveChats = async () => {
        try {
            const response = await fetch(
                `http://10.16.49.195:5000/api/activeChats`,
            );
            if (!response.ok) throw new Error("Failed to fetch active chats");
            const data = await response.json();
            setActiveChats(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const fetchChatUsers = async () => {
            if (searchTerm) {
                try {
                    const response = await fetch(
                        `http://10.16.49.195:5000/chat-users?search=${searchTerm}`,
                    );
                    const data = await response.json();
                    setChatUsers(data); 
                } catch (error) {
                    console.error("Error fetching chat users:", error);
                }
            } else {
                setChatUsers([]);
            }
        };

        fetchChatUsers();
    }, [searchTerm]);

    const handleAddUser = async () => {
        try {
            console.log(newUser)
            const response = await fetch("http://10.16.49.195:5000/api/addUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) throw new Error("Failed to add user");
            alert("User added successfully!");
            setNewUser({ name: "", email: "", role: "" }); 
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddMultipleUsers = async () => {
        if (!emailRange.start || !emailRange.end) {
            alert("Please provide a valid email range");
            return;
        }

        const startNum = parseInt(emailRange.start);
        const endNum = parseInt(emailRange.end);

        if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
            alert("Invalid email range");
            return;
        }

        const emails = [];
        for (let i = startNum; i <= endNum; i++) {
            emails.push(`${i}@chat.in`);
        }

        try {
            const response = await fetch(
                "http://10.16.49.195:5000/api/addMultipleUsers",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emails, role: "student" }),
                },
            );
            if (!response.ok) throw new Error("Failed to add multiple users");
            alert("Multiple users added successfully!");
            setEmailRange({ start: "", end: "" }); 
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUserClick = (userId, name, email) => {
        const userData = { userId, name, email };
        localStorage.setItem("op_userData", JSON.stringify(userData)); 
        navigate("/chat"); 
    };

    useEffect(() => {
        fetchUserFnds();
        fetchActiveChats();
    }, []);

    const loggedInUser = getUserData();

    return (
        <div className="home-container">
            <h1 className="welcome-title" style={{ color: "red" }}>
                Welcome to Unified Communication Platform
            </h1>
            {isAuthenticated ? (
                <div>
                    {/* Staff tools section */}
                    {loggedInUser?.role === "staff" && (
                        <div className="staff-section">
                            <h2>Staff Tools</h2>

                            {/* Add Single User */}
                            <div className="add-user-form">
                                <h3>Add Single User</h3>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            name: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value,
                                        })
                                    }
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            role: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Role</option>
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                </select>
                                <button onClick={handleAddUser}>
                                    Add User
                                </button>
                            </div>

                            {}
                            <div className="add-multiple-users-form">
                                <h3>Add Multiple Users</h3>
                                <input
                                    type="text"
                                    placeholder="Start ID (e.g., 2022115000)"
                                    value={emailRange.start}
                                    onChange={(e) =>
                                        setEmailRange({
                                            ...emailRange,
                                            start: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="End ID (e.g., 2022115010)"
                                    value={emailRange.end}
                                    onChange={(e) =>
                                        setEmailRange({
                                            ...emailRange,
                                            end: e.target.value,
                                        })
                                    }
                                />
                                <button onClick={handleAddMultipleUsers}>
                                    Add Multiple Users
                                </button>
                            </div>

                           
                        </div>
                    )}

                   
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search for users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {chatUsers.length > 0 && (
                            <div className="user-list">
                                <h2>Chat Users:</h2>
                                <ul>
                                    {chatUsers.map((user) => (
                                        <li key={user.id}>
                                            <button
                                                onClick={() =>
                                                    handleUserClick(
                                                        user.id,
                                                        user.name,
                                                        user.email,
                                                    )
                                                }
                                            >
                                                {user.name} ({user.email})
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="active-chats">
                        <h3 style={{ fontWeight: "bold" }}>
                            Currently Chatting Users
                        </h3>
                        <ul>
                            {activeChats.map((chatUser) => (
                                <li key={chatUser.id}>
                                    {chatUser.name} ({chatUser.email})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="chatGraph">
                        <ChatGraph users={userFnds} />{" "}
                       
                    </div>
                </div>
            ) : (
                <p>Please log in to access more features.</p>
            )}

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default Home;
