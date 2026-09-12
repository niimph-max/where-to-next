-- books.sql
-- ตาราง books (เล่ม/โฟโต้บุ๊กที่แชร์เป็นลิงก์ได้) + ฟังก์ชัน share_book
-- ต้องรันไฟล์นี้ก่อน ลิงก์แชร์เล่ม onevela.net/b/<id> ถึงจะทำงาน
-- (route /b/* เพิ่มเข้า vela-share Worker เมื่อ 8 ก.ย. 2026)
--
-- ⚠ ไฟล์นี้ dump จาก production (โปรเจกต์ onevela) เมื่อ 12 ก.ย. 2026
--   จาก information_schema / pg_policies / pg_indexes / pg_get_functiondef()
--   ตรงกับที่รันอยู่จริง ไม่ใช่ไฟล์ต้นฉบับที่เคยรัน
--   หมายเหตุ: ลำดับคอลัมน์เรียงตามตัวอักษรจากตอน dump ไม่ใช่ลำดับใน DDL เดิม
--   (ไม่มีผลต่อการทำงาน)

-- ══ ตาราง ══

create table if not exists public.books (
  id          text                     not null,
  owner       uuid                     not null,
  title       text                     not null default ''::text,
  author      text                     not null default ''::text,
  cover       text                     not null default ''::text,
  kind        text                     not null default 'photo'::text,
  vis         text                     not null default 'link'::text,
  photos      integer                  not null default 0,
  pages       integer                  not null default 0,
  views       integer                  not null default 0,
  plan        jsonb                    not null default '{}'::jsonb,
  updated_at  timestamp with time zone not null default now(),
  constraint books_pkey primary key (id)
);

create index if not exists books_owner_idx on public.books using btree (owner);
create index if not exists books_pub_idx   on public.books using btree (vis, updated_at desc);

-- ══ RLS ══
-- vis: 'link' = ใครมีลิงก์ก็เปิดได้, 'public' = เปิดสาธารณะ, อื่นๆ = เจ้าของเท่านั้น

alter table public.books enable row level security;

drop policy if exists books_read on public.books;
create policy books_read on public.books
  for select
  using ((vis = any (array['link'::text, 'public'::text])) or (auth.uid() = owner));

drop policy if exists books_write on public.books;
create policy books_write on public.books
  for all
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

-- ══ ฟังก์ชันสำหรับการ์ดลิงก์แชร์เล่ม ══
-- vela-share Worker เรียกผ่าน RPC: POST /rest/v1/rpc/share_book { p_id }
-- ดึงเฉพาะปก/ชื่อ/จำนวน — ห้ามลากก้อน plan (jsonb ก้อนใหญ่ กิน CPU ของ Worker)

CREATE OR REPLACE FUNCTION public.share_book(p_id text)
 RETURNS TABLE(title text, cover text, author text, photos integer, pages integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select b.title, b.cover, b.author, b.photos, b.pages
  from books b
  where b.id = p_id and b.vis in ('link', 'public')
  limit 1
$function$;

-- สิทธิ์ตามที่ตั้งอยู่จริงบน production
grant execute on function public.share_book(text) to anon, authenticated;
