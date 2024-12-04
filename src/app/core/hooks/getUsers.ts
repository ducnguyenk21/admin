// lib/getUsers.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

const getUsers = async () => {
  const usersCol = collection(db, "users");
  const userSnapshot = await getDocs(usersCol);

  const userList = userSnapshot.docs.map((doc) => ({
    uid: doc.id, // Sửa đổi ở đây: sử dụng doc.id thay vì doc.uid
    pic: doc.data().pic || "", // Cung cấp giá trị mặc định nếu không có
    email: doc.data().email || "", // Cung cấp giá trị mặc định nếu không có
    gender: doc.data().gender || "", // Cung cấp giá trị mặc định nếu không có
    level: doc.data().level || "", // Cung cấp giá trị mặc định nếu không có
    date_of_birth: doc.data().date_of_birth || "",
    role: doc.data().role || "", // Cung cấp giá trị mặc định nếu không có
    activate: doc.data().activate || false, // Cung cấp giá trị mặc định nếu không có
    fname: doc.data().fname || "", // Cung cấp giá trị mặc định nếu không có
    lname: doc.data().lname || "", // Cung cấp giá trị mặc định nếu không có
    height: doc.data().height || "", // Cung cấp giá trị mặc định nếu không có
    weight: doc.data().weight || "", // Cung cấp giá trị mặc định nếu không có
  }));

  return userList;
};

export default getUsers;
