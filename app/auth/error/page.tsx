import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | string[] | null>(null);
  useEffect(() => {
    // อ่านพารามิเตอร์ error จาก URL
    if (router.query.error) {
      setError(router.query.error);
    }
  }, [router.query]);

  if (error === 'OAuthAccountNotLinked') {
    return (
      <div>
        <h1>เกิดข้อผิดพลาด</h1>
        <p>บัญชีของคุณยังไม่ได้เชื่อมโยงกับ OAuth provider กรุณาลองใหม่อีกครั้ง</p>
        {/* เพิ่มลิงค์ให้ผู้ใช้ลองเข้าสู่ระบบใหม่ */}
      </div>
    );
  }

  return (
    <div>
      <h1>เกิดข้อผิดพลาดบางประการ</h1>
      <p>{error || 'ไม่ทราบข้อผิดพลาด'}</p>
    </div>
  );
}
