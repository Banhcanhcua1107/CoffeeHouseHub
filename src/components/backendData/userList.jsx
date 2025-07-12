import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://coffeehousehub-production.up.railway.app';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/users`)
      .then(res => {
        console.log("Dữ liệu từ API:", res.data);
        setUsers(res.data);
      })
      .catch(err => {
        console.error("Lỗi gọi API:", err);
      });
  }, []);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      {users.length === 0 ? (
        <p>Không có người dùng nào.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} - {user.fullname} - {user.userscol}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
