import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

// Khai báo Interface
interface Step {
  detail: string;
  title: string;
}

interface Difficulty {
  calo: number;
  rep: number;
  time: number;
}

interface Exercise {
  id: string;
  name: string;
  pic: string;
  video: string;
  descriptions: string;
  difficulty: {
    Beginner: Difficulty;
    Normal: Difficulty;
    Professional: Difficulty;
  };
  steps: Record<string, Step>;
}

const getExercises = async (): Promise<Exercise[]> => {
  const exercisesCol = collection(db, "Exercises");
  const exerciseSnapshot = await getDocs(exercisesCol);

  const exerciseList: Exercise[] = exerciseSnapshot.docs.map((doc) => {
    const data = doc.data(); // Không ép kiểu ngay tại đây, để xử lý linh hoạt hơn
    const name = data.name || "Unnamed Exercise";
    // Tạo đối tượng steps
    const stepEntries = data.steps || {};
    const steps: Record<string, Step> = Object.entries(stepEntries).reduce(
      (acc, [key, stepData]) => {
        const step = stepData as Step; // Ép kiểu stepData thành Step
        acc[key] = {
          detail: step?.detail || "", // Lấy giá trị detail hoặc chuỗi rỗng
          title: step?.title || "", // Lấy giá trị title hoặc chuỗi rỗng
        };
        return acc;
      },
      {} as Record<string, Step>
    );

    return {
      id: doc.id, // Lấy ID của document từ Firestore, không phải từ data
      name: name,
      pic: data.pic || "",
      video: data.video || "",
      descriptions: data.descriptions || "",
      difficulty: {
        Beginner: {
          calo: data.difficulty?.Beginner?.calo || 0,
          rep: data.difficulty?.Beginner?.rep || 0,
          time: data.difficulty?.Beginner?.time || 0,
        },
        Normal: {
          calo: data.difficulty?.Normal?.calo || 0,
          rep: data.difficulty?.Normal?.rep || 0,
          time: data.difficulty?.Normal?.time || 0,
        },
        Professional: {
          calo: data.difficulty?.Professional?.calo || 0,
          rep: data.difficulty?.Professional?.rep || 0,
          time: data.difficulty?.Professional?.time || 0,
        },
      },
      steps,
    };
  });

  return exerciseList;
};

export default getExercises;
