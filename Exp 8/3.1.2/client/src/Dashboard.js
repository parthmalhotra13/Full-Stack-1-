
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.message);
      } catch {
        setData("Unauthorized");
      }
    };
    fetchData();
  }, []);

  return <h2>{data}</h2>;
}
