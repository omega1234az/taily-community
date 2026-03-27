FROM node:20-alpine AS base

# ขั้นตอน Install dependencies (deps)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ทำการ copy ไฟล์ package มาเพื่อติดตั้ง Node modules
COPY package.json package-lock.json ./
RUN npm ci

# ขั้นตอน Build (builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client ก่อน Build Next.js
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# สร้าง Build ก้อนการใช้งานสำหรับ Production
RUN npx next build

# ขั้นตอนรัน Production (runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# คัดลอกโฟลเดอร์ Public
COPY --from=builder /app/public ./public

# สร้างโฟลเดอร์สำหรับ Next.js cache และกำหนดสิทธิ์
RUN mkdir .next
RUN chown nextjs:nodejs .next

# คัดลอกเฉพาะไฟล์ที่จำเป็น (ต้องมี output: 'standalone' ใน next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# คำสั่งสำหรับเริ่มเซิร์ฟเวอร์
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
