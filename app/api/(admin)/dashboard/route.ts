import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type YearData = {
  year: string;
  lostPets: number;      // จำนวนโพส LostPet
  ownerSearch: number;   // จำนวนโพส FoundPet
  newUsers: number;
  cluesReported: number;
  lostPetViews: number;  // ยอดวิว LostPet (แบบเก่า)
  ownerSearchViews: number; // ยอดวิว FoundPet (แบบเก่า)
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedType = searchParams.get('type') || 'all'; // all, lost, found
  const selectedCategoryId = searchParams.get('category') || 'all'; // speciesId
  const range = searchParams.get('range') || '1y'; // 1w, 1m, 6m, 1y
  const metric = searchParams.get('metric') || 'posts'; // posts (ใหม่) หรือ views (เก่า)

  const now = new Date();
  const startDate = new Date(now);

  // คำนวณช่วงเวลา
  switch (range) {
    case '1w':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  // ---------- ดึงข้อมูลจากฐานข้อมูล ----------

  const lostPets = await prisma.lostPet.findMany({
    where: {
      lostDate: { gte: startDate },
      ...(selectedCategoryId !== 'all' && {
        pet: { speciesId: Number(selectedCategoryId) },
      }),
    },
    select: {
      lostDate: true,
      views: true,
      id: true,
      pet: { select: { speciesId: true } },
    },
  });

  const foundPets = await prisma.foundPet.findMany({
    where: {
      foundDate: { gte: startDate },
      ...(selectedCategoryId !== 'all' && {
        speciesId: Number(selectedCategoryId),
      }),
    },
    select: {
      foundDate: true,
      views: true,
      id: true,
      speciesId: true,
    },
  });

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  const clues = await prisma.clue.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  // ---------- รวมข้อมูลตามปี ----------
  const result: Record<string, YearData> = {};

  // lostPets
  for (const item of lostPets) {
    if (
      selectedCategoryId !== 'all' &&
      item.pet.speciesId !== Number(selectedCategoryId)
    ) continue;

    const year = item.lostDate.getFullYear().toString();
    if (!result[year]) {
      result[year] = {
        year,
        lostPets: 0,
        ownerSearch: 0,
        newUsers: 0,
        cluesReported: 0,
        lostPetViews: 0,
        ownerSearchViews: 0,
      };
    }

    // นับจำนวนโพส (ใหม่)
    result[year].lostPets += 1;
    
    // นับยอดวิว (แบบเก่า)
    result[year].lostPetViews += item.views || 0;
  }

  // foundPets
  for (const item of foundPets) {
    if (
      selectedCategoryId !== 'all' &&
      item.speciesId !== Number(selectedCategoryId)
    ) continue;

    const year = item.foundDate.getFullYear().toString();
    if (!result[year]) {
      result[year] = {
        year,
        lostPets: 0,
        ownerSearch: 0,
        newUsers: 0,
        cluesReported: 0,
        lostPetViews: 0,
        ownerSearchViews: 0,
      };
    }

    // นับจำนวนโพส (ใหม่)
    result[year].ownerSearch += 1;
    
    // นับยอดวิว (แบบเก่า)
    result[year].ownerSearchViews += item.views || 0;
  }

  // users
  for (const user of users) {
    const year = user.createdAt.getFullYear().toString();
    if (!result[year]) {
      result[year] = {
        year,
        lostPets: 0,
        ownerSearch: 0,
        newUsers: 0,
        cluesReported: 0,
        lostPetViews: 0,
        ownerSearchViews: 0,
      };
    }
    result[year].newUsers += 1;
  }

  // clues
  for (const clue of clues) {
    const year = clue.createdAt.getFullYear().toString();
    if (!result[year]) {
      result[year] = {
        year,
        lostPets: 0,
        ownerSearch: 0,
        newUsers: 0,
        cluesReported: 0,
        lostPetViews: 0,
        ownerSearchViews: 0,
      };
    }
    result[year].cluesReported += 1;
  }

  let chartData = Object.values(result).sort(
    (a, b) => Number(a.year) - Number(b.year)
  );

  // ถ้าไม่มีข้อมูลเลย ให้ส่งปีปัจจุบัน
  if (chartData.length === 0) {
    chartData = [
      {
        year: now.getFullYear().toString(),
        lostPets: 0,
        ownerSearch: 0,
        newUsers: 0,
        cluesReported: 0,
        lostPetViews: 0,
        ownerSearchViews: 0,
      },
    ];
  }

  return NextResponse.json(chartData);
}