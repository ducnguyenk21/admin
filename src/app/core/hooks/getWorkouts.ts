import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

// Định nghĩa kiểu Workout và Level trực tiếp trong tệp
interface Workout {
  id: string; // ID của tài liệu trong Firestore
  name: string; // Tên bài tập
  exercise_list: Record<string, string>; // Giữ nguyên dưới dạng đối tượng
  level: ("Weight Loss" | "Increase Fitness" | "Fat Loss & Toning")[]; // Các cấp độ hợp lệ
  pic: string; // Đường dẫn hình ảnh
  tool: string[]; // Mảng ID công cụ
}

const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const workoutsCol = collection(db, "Workouts");
    const workoutSnapshot = await getDocs(workoutsCol);

    const workoutList: Workout[] = workoutSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Giữ exercise_list dưới dạng map
      const exerciseListObject: Record<string, string> =
        data.exercise_list || {};

      // Đảm bảo levels được lọc và ép kiểu chính xác
      const levels: (
        | "Weight Loss"
        | "Increase Fitness"
        | "Fat Loss & Toning"
      )[] = (data.level || []).filter((level: string) =>
        ["Weight Loss", "Increase Fitness", "Fat Loss & Toning"].includes(level)
      ) as ("Weight Loss" | "Increase Fitness" | "Fat Loss & Toning")[];

      return {
        id: doc.id, // ID tài liệu
        name: data.name || "Unnamed Workout",
        exercise_list: exerciseListObject, // Giữ nguyên định dạng đối tượng
        level: levels,
        pic: data.pic || "",
        tool: data.tool || [], // Mảng ID công cụ
      };
    });

    return workoutList;
  } catch (error) {
    console.error("Error fetching workouts:", error);
    throw new Error("Could not fetch workouts");
  }
};

export default getWorkouts;
