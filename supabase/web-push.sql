-- web-push.sql — เตือนบันทึกบนเว็บแอป (Web Push) · 22 ต.ค. 2569
--
-- ทำไมต้องมี: แอป iOS ตั้งนาฬิกาปลุกในเครื่องเองได้ (local notification)
--   แต่เว็บทำไม่ได้ ต้องให้เซิร์ฟเวอร์ "ยิง" มาตอนถึงเวลา → เก็บว่าเครื่องไหนรับได้ เตือนกี่โมง เขตเวลาไหน
--
-- รันในแดชบอร์ด Supabase → SQL Editor ทีละส่วน (ส่วนที่ 1 ก่อน · ส่วนที่ 2 หลัง deploy ฟังก์ชันแล้ว)

-- ══ ส่วนที่ 1: ตาราง ══

create table if not exists public.push_subs (
  endpoint    text        primary key,             -- ที่อยู่ของเครื่อง (จาก PushSubscription) หนึ่งแถวต่อหนึ่งเครื่อง
  user_id     uuid        not null references auth.users(id) on delete cascade,
  p256dh      text        not null,
  auth        text        not null,
  on_         boolean     not null default true,   -- สวิตช์ "เตือนบันทึกประจำวัน"
  at_time     text        not null default '20:30',-- HH:MM เวลาท้องถิ่นของเครื่อง
  tz          text        not null default 'Asia/Bangkok',
  body        text        not null default '',     -- ข้อความเตือนรายวัน (แอปเขียนให้ พกชื่อเมือง/ทริป)
  logged      text        not null default '',     -- 'YYYY-MM-DD' วันที่บันทึกแล้ว → วันนั้นเงียบ
  trips_due   jsonb       not null default '[]',   -- เฟส 2: [{id,name,items,photos,at:'YYYY-MM-DD'}]
  last_sent   text        not null default '',     -- 'YYYY-MM-DD' วันที่ยิงรายวันไปแล้ว (ห้ามทวงซ้ำ)
  sent_trips  jsonb       not null default '[]',   -- id ทริปที่ยิงเฟส 2 ไปแล้ว
  updated_at  timestamptz not null default now()
);

create index if not exists push_subs_user_idx on public.push_subs (user_id);

alter table public.push_subs enable row level security;

-- ผู้ใช้จัดการได้เฉพาะเครื่องของตัวเอง · ฟังก์ชันส่ง (service role) ข้าม RLS อยู่แล้ว
drop policy if exists push_subs_own on public.push_subs;
create policy push_subs_own on public.push_subs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ══ ส่วนที่ 2: ตั้งเวลาให้ยิงทุก 15 นาที (รันหลัง deploy ฟังก์ชัน push-reminders แล้ว) ══
-- ต้องเปิด extension pg_cron และ pg_net ก่อน (Database → Extensions)
-- แทน <CRON_KEY> ด้วยค่าเดียวกับ secret CRON_KEY ของฟังก์ชัน — ⚠ ห้าม commit ค่าจริงลงไฟล์นี้

-- select cron.schedule('push-reminders', '*/15 * * * *', $$
--   select net.http_post(
--     url := 'https://glnpyzlbalxnqrqxdsuo.supabase.co/functions/v1/push-reminders',
--     headers := '{"Content-Type":"application/json","x-cron-key":"<CRON_KEY>"}'::jsonb,
--     body := '{}'::jsonb
--   );
-- $$);

-- ดูว่าตั้งแล้ว: select * from cron.job;
-- ดูผลรอบล่าสุด: select * from cron.job_run_details order by start_time desc limit 5;
-- ยกเลิก:       select cron.unschedule('push-reminders');
