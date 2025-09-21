// utils/petFormatter.ts
type PetImage = {
  id: number;
  url: string;
  petId: number;
  mainImage: boolean;
};



export const formatNeuteredStatus = (isNeutered: number): string => {
  return isNeutered === 1 ? "ทำหมันแล้ว" : "ไม่ได้ทำหมัน";
};

export const formatReward = (reward?: number): string => {
  if (!reward || reward === 0) return "ไม่มีรางวัล";
  return `${reward.toLocaleString()} บาท`;
};

export const formatLostPetStatus = (status: string): string => {
  const statusMap = {
    lost: "หาย",
    found: "พบแล้ว",
    pending: "รอดำเนินการ",
    closed: "ปิดคดี",
    reunited: "กลับมาแล้ว",
    reported: "รายงานแล้ว",
    fake: "เป็นข้อมูลเท็จ",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export const getMainPetImage = (images: PetImage[]): string | null => {
  const mainImage = images.find((img) => img.mainImage);
  return mainImage?.url || images[0]?.url || null;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatColors = (colors?: string[]): string => {
  if (!colors || colors.length === 0) return "ไม่ระบุ";
  return colors.join(", ");
};
