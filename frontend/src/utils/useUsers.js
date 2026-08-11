import { useEffect, useState } from "react";
import api from "../api/axios";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data.data)).catch(() => {});
  }, []);
  return users;
};
