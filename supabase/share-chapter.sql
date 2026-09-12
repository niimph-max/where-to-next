-- share-chapter.sql
-- ฟังก์ชันสำหรับการ์ดลิงก์แชร์ "ตอน" ที่ vela-share Worker เรียกผ่าน RPC
--   POST /rest/v1/rpc/share_chapter  { p_story, p_chapter }
--
-- ทำไมต้องมีฟังก์ชันนี้: Worker แพลนฟรีมี CPU 10ms ถ้า select ก้อน data ทั้งก้อน
-- (เนื้อตอนโตได้หลาย MB) จะประมวลผลไม่ทันแล้วตกไปใช้การ์ดกลาง
-- ฟังก์ชันนี้ตัดคำโปรยให้ที่ฝั่ง database → Worker ได้ข้อมูลก้อนเล็กพร้อมใช้
-- ถ้าไม่มีฟังก์ชันนี้ Worker ยังทำงานได้ แต่การ์ดจะไม่มีคำโปรยจากเนื้อเรื่องจริง
--
-- SECURITY DEFINER + published = true → อ่านได้เฉพาะตอนที่เผยแพร่แล้ว
--
-- ⚠ ไฟล์นี้ dump จาก production (โปรเจกต์ onevela) เมื่อ 12 ก.ย. 2026
--   ด้วย pg_get_functiondef() — ตรงกับที่รันอยู่จริง ไม่ใช่ไฟล์ต้นฉบับที่เคยรัน

CREATE OR REPLACE FUNCTION public.share_chapter(p_story text, p_chapter text)
 RETURNS TABLE(title text, cover text, excerpt text, author_name text, photo text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    coalesce(c.data->>'title', '')                                      as title,
    coalesce(c.data->>'cover', '')                                      as cover,
    left(regexp_replace(left(coalesce(c.data->>'html', ''), 4000),
                        '<[^>]*>', ' ', 'g'), 400)                      as excerpt,
    coalesce(c.data->>'authorName', '')                                 as author_name,
    coalesce(c.data->'photos'->>0, '')                                  as photo
  from chapters c
  where c.story_id = p_story and c.id = p_chapter and c.published = true
  limit 1
$function$;

-- สิทธิ์ตามที่ตั้งอยู่จริงบน production
grant execute on function public.share_chapter(text, text) to anon, authenticated;
