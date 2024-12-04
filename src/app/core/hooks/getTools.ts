// lib/getTools.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

const getTools = async () => {
  try {
    const toolsCol = collection(db, "Tools");
    const userSnapshot = await getDocs(toolsCol);

    const toolsList = userSnapshot.docs
      .map((doc) => {
        const data = doc.data();

        // Kiểm tra sự tồn tại của các trường cần thiết
        if (data.name && data.pic) {
          return {
            id: doc.id, // Lưu ID của document
            name: data.name, // Lấy field "name"
            pic: data.pic, // Lấy field "pic"
          };
        }
        return null; // Trả về null nếu dữ liệu không hợp lệ
      })
      .filter((tool) => tool !== null); // Lọc bỏ các giá trị null

    return toolsList;
  } catch (error) {
    console.error("Error fetching tools: ", error);
    throw new Error("Failed to fetch tools");
  }
};

export default getTools;
