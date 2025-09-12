import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type YearData = {
  year: string;
  lostPets: number;
  ownerSearch: number;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedType = searchParams.get('type') || 'all'; // all, lost, found
  const selectedCategoryId = searchParams.get('category') || 'all'; // ส่ง speciesId มา
  const range = searchParams.get('range') || '1y'; // 1w, 1m, 6m, 1y

  const now = new Date();
  const startDate = new Date(now);

  // คำนวณ startDate ตาม range
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

  // ---------- LostPets ----------
  const lostPets = await prisma.lostPet.findMany({
    where: {
      lostDate: { gte: startDate },
      ...(selectedCategoryId !== 'all' && {
        pet: { speciesId: Number(selectedCategoryId) }
      }),
    },
    select: {
      lostDate: true,
      views: true,
      pet: { select: { speciesId: true } },
    },
  });

  // ---------- FoundPets ----------
  const foundPets = await prisma.foundPet.findMany({
    where: {
      foundDate: { gte: startDate },
      ...(selectedCategoryId !== 'all' && {
        speciesId: Number(selectedCategoryId)
      }),
    },
    select: {
      foundDate: true,
      views: true,
      speciesId: true,
    },
  });

  // ---------- Filter ----------
  const filteredLost =
    selectedType === 'all' || selectedType === 'lost' ? lostPets : [];
  const filteredFound =
    selectedType === 'all' || selectedType === 'found' ? foundPets : [];

  // ---------- Aggregate ----------
  const result: Record<string, YearData> = {};

  // LostPets
  for (const item of filteredLost) {
    if (
      selectedCategoryId !== 'all' &&
      item.pet.speciesId !== Number(selectedCategoryId)
    )
      continue;

    const year = item.lostDate.getFullYear().toString();
    if (!result[year]) {
      result[year] = { year, lostPets: 0, ownerSearch: 0 };
    }
    result[year].lostPets += item.views || 0;
  }

  // FoundPets
  for (const item of filteredFound) {
    if (
      selectedCategoryId !== 'all' &&
      item.speciesId !== Number(selectedCategoryId)
    )
      continue;

    const year = item.foundDate.getFullYear().toString();
    if (!result[year]) {
      result[year] = { year, lostPets: 0, ownerSearch: 0 };
    }
    result[year].ownerSearch += item.views || 0;
  }

  let chartData = Object.values(result).sort(
    (a, b) => Number(a.year) - Number(b.year)
  );

  // ---------- ส่ง default ปีปัจจุบันถ้าไม่มีข้อมูล ----------
  if (chartData.length === 0) {
    chartData = [
      {
        year: now.getFullYear().toString(),
        lostPets: 0,
        ownerSearch: 0,
      },
    ];
  }

  return NextResponse.json(chartData);
}
