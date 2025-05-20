"use client";

import React from "react";
import { useParams } from "next/navigation";
import LostPetDetails from "@/app/component/LostPetDetails";
import OwnerPetDetails from "@/app/component/OwnerPetDetails";

type LostPet = {
  id: string;
  name: string;
  age: string;
  gender: string;
  type: string;
  breed: string;
  sterilized: string;
  color: string;
  marks: string;
  description: string;
  lostDate: string;
  lostDetail: string;
  lostLocation: string;
  images: string[];
};

type OwnerPet = {
  id: string;
  name: string;
  images: string[];
  gender: string;
  breed: string;
  lostDate: string;
  color: string;
  type: string;
  marks?: string;
  description?: string;
  lostLocation?: string;
};

const petsLost: LostPet[] = [
  {
    id: "01",
    name: "ไข่ตุ๋น",
    age: "1 ปี",
    gender: "ตัวผู้",
    type: "แมว",
    breed: "บริติช ช็อตแฮร์",
    sterilized: "ทำหมันแล้ว",
    color: "สีส้ม",
    marks: "จุดสีขาวที่อก",
    description: "แมวเป็นมิตร ขี้อ้อน หายไปจากบ้านตอนเย็น",
    lostDate: "2025-02-05",
    lostDetail: "หายจากบริเวณหน้าบ้าน",
    lostLocation: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
    images: [
      "/home/eggtun2.png",
      "/home/eggtun3.png",
      "/home/eggtun4.png",
      "/home/eggtun5.png",
    ],
  },
  {
    id: "02",
    name: "ส้มโอ",
    age: "2 ปี",
    gender: "ตัวผู้",
    type: "สุนัข",
    breed: "เพมโบรก เวลช์คอร์กี้",
    sterilized: "ไม่ได้ทำหมัน",
    color: "ส้ม",
    marks: "แถบสีขาวตรงอก",
    description: "สุนัขขี้เล่น ไม่กัด",
    lostDate: "2025-01-05",
    lostDetail: "น่าจะววิ่งออกไปตอนเปิดรั้ว",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/sumo.png",
      "/home/somo2.jpg",
      "/home/somo3.jpg",
      "/home/somo4.jpg",
    ],
  },

  {
    id: "03",
    name: "ไอวี่",
    age: "2 ปี",
    gender: "ตัวเมีย",
    type: "สุนัข",
    breed: "ซามอย",
    sterilized: "ไม่ทราบ",
    color: "ขาว",
    marks: "ขนฟูทั่วตัว",
    description: "ขี้เล่น เป็นมิตร",
    lostDate: "2025-02-28",
    lostDetail: "หายจากหน้าบ้านขณะไม่มีคนดู",
    lostLocation: "บ้านหนองรี อ.บ่อพลอย จ.กาญจนบุรี",
    images: [
      "/home/samoy.png",
      "/home/samoy2.jpg",
      "/home/samoy3.jpg",
      "/home/samoy4.jpg",
    ],
  },
  {
    id: "04",
    name: "จาเบล",
    age: "1 ปี",
    gender: "ตัวผู้",
    type: "หนู",
    breed: "แฮมสเตอร์แคระขาว",
    sterilized: "ไม่ทราบ",
    color: "ขาวเทา",
    marks: "ไม่มี",
    description: "ตัวเล็ก ขี้ตกใจ",
    lostDate: "2025-02-15",
    lostDetail: "หายออกจากกรงในเวลากลางคืน",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/ham.jpg",
      "/home/ham2.jpeg",
      "/home/ham3.jpg",
      "/home/ham4.jpg",
    ],
  },
  {
    id: "05",
    name: "ไคลี่",
    age: "3 ปี",
    gender: "ตัวเมีย",
    type: "กระรอก",
    breed: "ชิปมังก์",
    sterilized: "ไม่ทราบ",
    color: "น้ำตาลลายขาว",
    marks: "แถบสีเข้มหลังตัว",
    description: "กระตือรือร้น วิ่งไว",
    lostDate: "2025-05-05",
    lostDetail: "อาจหลุดออกไปจากกรง",
    lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
    images: [
      "/home/karog.jpg",
      "/home/karog2.jpeg",
      "/home/karog3.jpg",
      "/home/karog4.jpeg",
    ],
  },
  {
    id: "06",
    name: "มิลา",
    age: "2 ปี",
    gender: "ตัวเมีย",
    type: "นก",
    breed: "ค็อกคาเทล",
    sterilized: "ไม่ทราบ",
    color: "เหลือง เทา ขาว",
    marks: "หัวเหลือง แก้มส้ม",
    description: "ร้องเก่ง ชอบบินเล่น",
    lostDate: "2025-01-09",
    lostDetail: "บินหลุดออกจากหน้าต่าง",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/nok.jpg",
      "/home/nok2.jpeg",
      "/home/nok3.jpeg",
      "/home/nok4.jpg",
    ],
  },
  {
    id: "07",
    name: "ริรี่",
    age: "2 ปี",
    gender: "ตัวเมีย",
    type: "กระต่าย",
    breed: "ฮอลแลนด์ลอป",
    sterilized: "ไม่ทราบ",
    color: "น้ำตาลอ่อน",
    marks: "หูตก",
    description: "ขี้อ้อน ชอบนอนเล่น",
    lostDate: "2025-04-10",
    lostDetail: "หายระหว่างให้อาหาร",
    lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
    images: [
      "/home/katay.jpg",
      "/home/katay2.jpg",
      "/home/katay3.jpg",
      "/home/katay4.jpg",
    ],
  },
  {
    id: "08",
    name: "โอเวน",
    age: "3 ปี",
    gender: "ตัวผู้",
    type: "นก",
    breed: "เลิฟเบิร์ดหน้ากุหลาบ",
    sterilized: "ไม่ทราบ",
    color: "หลากสี (แดง เขียว)",
    marks: "หน้าแดงกุหลาบ",
    description: "ขี้เล่น ชอบร้อง",
    lostDate: "2025-05-22",
    lostDetail: "บินหลุดออกจากกรง",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/kok2.jpg",
      "/home/kok1.jpeg",
      "/home/kok3.jpg",
      "/home/kok4.jpg",
    ],
  },
  {
    id: "09",
    name: "อัลเดน",
    age: "3 ปี",
    gender: "ตัวผู้",
    type: "เฟอร์ริต",
    breed: "เฟอร์ริต",
    sterilized: "ไม่ทราบ",
    color: "น้ำตาลอ่อน",
    marks: "หางยาว",
    description: "ขี้เล่น วิ่งเร็ว",
    lostDate: "2025-04-30",
    lostDetail: "หลุดออกจากบ้านระหว่างทำความสะอาด",
    lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
    images: [
      "/home/ferrit.jpg",
      "/home/ferrit2.jpg",
      "/home/ferrit3.jpg",
      "/home/ferrit4.jpg",
    ],
  },
  {
    id: "10",
    name: "จ๊ะโอ๋",
    age: "2 ปี",
    gender: "ตัวผู้",
    type: "สุนัข",
    breed: "ไทย",
    sterilized: "ไม่ทราบ",
    color: "ขาวดำ",
    marks: "จุดดำบริเวณตา",
    description: "ร่าเริง ชอบวิ่ง",
    lostDate: "2025-03-02",
    lostDetail: "เปิดประตูแล้ววิ่งออกไป",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/thai.png",
      "/home/thai2.jpg",
      "/home/thai3.jpg",
      "/home/thai4.jpg",
    ],
  },
  {
    id: "11",
    name: "ปุกปุย",
    age: "2 ปี",
    gender: "ตัวผู้",
    type: "เม่นแคระ",
    breed: "เม่นแคระ",
    sterilized: "ไม่ทราบ",
    color: "น้ำตาลอ่อน",
    marks: "ไม่มี",
    description: "ขี้อาย ชอบม้วนตัว",
    lostDate: "2025-05-03",
    lostDetail: "หายระหว่างทำความสะอาดกรง",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/men.jpg",
      "/home/men2.jpg",
      "/home/men3.jpg",
      "/home/men4.jpg",
    ],
  },
  {
    id: "12",
    name: "มูมู่",
    age: "3 ปี",
    gender: "ตัวผู้",
    type: "ชูก้าไรเดอร์",
    breed: "ชูก้าไรเดอร์",
    sterilized: "ไม่ทราบ",
    color: "ขาว",
    marks: "แถบสีเข้มกลางหลัง",
    description: "กระโดดเก่ง ชอบเกาะ",
    lostDate: "2025-03-20",
    lostDetail: "หายตอนเปิดกรงทำความสะอาด",
    lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
    images: [
      "/home/chuga.jpg",
      "/home/chuga2.jpeg",
      "/home/chuga3.jpg",
      "/home/chuga4.jpg",
    ],
  },
];

const petsOwner: OwnerPet[] = [
  {
    id: "13",
    name: "ไข่ตุ๋น",
    images: [
      "/home/eggtun.png",
      "/home/eggtun2.png",
      "/home/eggtun3.png",
      "/home/eggtun4.png",
    ],
    gender: "ตัวผู้",
    breed: "บริติช ช็อตแฮร์",
    lostDate: "2025-05-10",
    type: "แมว",
    color: "ส้ม",
    marks: "น้องมีสีขาวตรงคาง",
    description: "น้องเดินไปเดินมาหน้าบ้านนานแล้ว",
    lostLocation: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
  },

  {
    id: "14",
    name: "ส้มโอ",
    images: [
      "/home/sumo.png",
      "/home/somo2.jpg",
      "/home/somo3.jpg",
      "/home/somo4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "เพมโบรก เวลช์คอร์กี้",
    lostDate: "2025-05-08",
    type: "สุนัข",
    color: "ส้มขาว",
    marks: "หางสั้น ขาสั้น",
    description: "พบเดินหลงทางใกล้สนามเด็กเล่น ดูสะอาดและเป็นมิตร",
    lostLocation: "หมู่บ้านสุขสันต์ อ.เมือง จ.เชียงใหม่",
  },
  {
    id: "15",
    name: "ไอวี่",
    images: [
      "/home/samoy.png",
      "/home/samoy2.jpg",
      "/home/samoy3.jpg",
      "/home/samoy4.jpg",
    ],
    gender: "ตัวเมีย",
    breed: "ซามอย",
    lostDate: "2025-06-02",
    type: "สุนัข",
    color: "ขาว",
    marks: "มีปลอกคอสีฟ้า",
    description: "พบอยู่แถวตลาดนัด ดูเป็นมิตรและเชื่อง",
    lostLocation: "สวนสัตว์ลพบุรี อ.เมือง จ.ลพบุรี",
  },
  {
    id: "16",
    name: "จาเบล",
    images: [
      "/home/ham.jpg",
      "/home/ham2.jpeg",
      "/home/ham3.jpg",
      "/home/ham4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "แฮมสเตอร์แคระขาว",
    lostDate: "2025-02-13",
    type: "หนู",
    color: "ขาวเทา",
    marks: "มีจุดดำที่หลัง",
    description: "มีคนเก็บได้ที่ใต้โต๊ะในร้านอาหาร",
    lostLocation: "หอพัก A12 ม.ธรรมศาสตร์ รังสิต",
  },
  {
    id: "17",
    name: "ไคลี่",
    images: [
      "/home/karog.jpg",
      "/home/karog2.jpeg",
      "/home/karog3.jpg",
      "/home/karog4.jpeg",
    ],
    gender: "ตัวเมีย",
    breed: "ชิปมังก์",
    lostDate: "2025-05-06",
    type: "กระรอก",
    color: "น้ำตาลดำ",
    marks: "มีแถบดำกลางหลัง",
    description: "พบปีนเล่นอยู่บนต้นไม้ในสวนสาธารณะ",
    lostLocation: "หมู่บ้านเบญจพร จ.นครปฐม",
  },
  {
    id: "18",
    name: "มิลา",
    images: [
      "/home/nok.jpg",
      "/home/nok2.jpeg",
      "/home/nok3.jpeg",
      "/home/nok4.jpg",
    ],
    gender: "ตัวเมีย",
    breed: "ค็อกคาเทล",
    lostDate: "2025-01-12",
    type: "นก",
    color: "เหลืองแก้มส้ม",
    marks: "หางยาว มีเสียงร้องเป็นเอกลักษณ์",
    description: "บินมาเกาะที่หน้าต่างบ้านพัก",
    lostLocation: "หมู่บ้านสันติสุข อ.เมือง จ.ระยอง",
  },
  {
    id: "19",
    name: "ริรี่",
    images: [
      "/home/katay.jpg",
      "/home/katay2.jpg",
      "/home/katay3.jpg",
      "/home/katay4.jpg",
    ],
    gender: "ตัวเมีย",
    breed: "ฮอลแลนด์ลอป",
    lostDate: "2025-04-15",
    type: "กระต่าย",
    color: "น้ำตาลอ่อน",
    marks: "หูตก ขนนุ่ม",
    description: "พบเดินหลงทางอยู่ริมถนน",
    lostLocation: "อพาร์ตเมนต์พหลโยธิน 24 กรุงเทพฯ",
  },
  {
    id: "20",
    name: "โอเวน",
    images: [
      "/home/kok2.jpg",
      "/home/kok1.jpeg",
      "/home/kok3.jpg",
      "/home/kok4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "เลิฟเบิร์ดหน้ากุหลาบ",
    lostDate: "2025-05-23",
    type: "นก",
    color: "เหลืองเขียว",
    marks: "แก้มแดง หัวเหลือง",
    description: "มีคนพบเกาะอยู่บนสายไฟข้างถนน",
    lostLocation: "บ้านคลองสาน กรุงเทพฯ",
  },
  {
    id: "21",
    name: "อัลเดน",
    images: [
      "/home/ferrit.jpg",
      "/home/ferrit2.jpg",
      "/home/ferrit3.jpg",
      "/home/ferrit4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "เฟอร์ริต",
    lostDate: "2025-05-02",
    type: "เฟอร์ริต",
    color: "น้ำตาลอ่อน",
    marks: "ลำตัวยาว หางพอง",
    description: "หลงมาอยู่หน้าร้านสะดวกซื้อ",
    lostLocation: "สวนจตุจักร กรุงเทพฯ",
  },
  {
    id: "22",
    name: "จ๊ะโอ๋",
    images: [
      "/home/thai.png",
      "/home/thai2.jpg",
      "/home/thai3.jpg",
      "/home/thai4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "ไทย",
    lostDate: "2025-03-04",
    type: "สุนัข",
    color: "ขาวดำ",
    marks: "จุดดำบริเวณตา",
    description: "พบเดินอยู่บริเวณวัด ไม่มีปลอกคอ",
    lostLocation: "ชานเมืองนครราชสีมา",
  },
  {
    id: "23",
    name: "ปุกปุย",
    images: [
      "/home/men.jpg",
      "/home/men2.jpg",
      "/home/men3.jpg",
      "/home/men4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "เม่นแคระ",
    lostDate: "2025-03-05",
    type: "เม่นแคระ",
    color: "ขาวน้ำตาล",
    marks: "ไม่มี",
    description: "มีคนพบในพุ่มไม้หน้าอพาร์ตเมนต์",
    lostLocation: "คอนโดแถวจรัญสนิทวงศ์",
  },
  {
    id: "24",
    name: "มูมู่",
    images: [
      "/home/chuga.jpg",
      "/home/chuga2.jpeg",
      "/home/chuga3.jpg",
      "/home/chuga4.jpg",
    ],
    gender: "ตัวผู้",
    breed: "ชูก้าไรเดอร์",
    lostDate: "2025-03-20",
    type: "ชูก้าไรเดอร์",
    color: "เทาอ่อน",
    marks: "แถบสีเข้มกลางหลัง",
    description: "ปีนมาเกาะอยู่บนรั้วหน้าบ้าน",
    lostLocation: "บ้านสวนพัฒนา บางบัวทอง นนทบุรี",
  },
];

export default function Id() {
  const params = useParams();
  const petId = params?.id;

  // แก้ชื่อ array เป็น petsLost
  const lostPet = petsLost.find((p) => p.id === petId);
  const ownerPet = petsOwner.find((p) => p.id === petId);

  if (!lostPet && !ownerPet) {
    return <div>ไม่พบข้อมูลสัตว์หายหรือหาเจ้าของ</div>;
  }

  if (lostPet) {
    return <LostPetDetails pet={lostPet} />;
  }

  if (ownerPet) {
    return <OwnerPetDetails pet={ownerPet} />;
  }

  return null;
}
