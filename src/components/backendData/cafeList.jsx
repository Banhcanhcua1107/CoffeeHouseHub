import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CafeList() {
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/cafe')
      .then(res => {
        console.log("Dữ liệu từ API:", res.data);
        setCafes(res.data);
      })
      .catch(err => {
        console.error("Lỗi gọi API:", err);
      });
  }, []);

  return (
    <div>
      <h2>Danh sách cafe</h2>
      {cafes.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <ul>
          {cafes.map((cafe) => (
            <li key={cafe.id}>
              <div>{cafe.name}</div> {/* Giả sử bạn có trường 'name' */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CafeList;
