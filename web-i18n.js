// Vela เว็บ (หน้าขาย + ศูนย์ช่วยเหลือ + คู่มือ + นโยบาย) — สลับไทย/อังกฤษ
// วิธีทำงาน: หน้าเว็บเขียนเป็นไทยตามปกติ (แสดงผลไว) แล้วสคริปต์นี้กวาด text node
// สลับเป็นอังกฤษตามพจนานุกรมด้านล่างเมื่อผู้ใช้เลือก EN (หรือเบราว์เซอร์ไม่ใช่ไทย)
// เพิ่มคำแปลได้เรื่อย ๆ — ประโยคที่ยังไม่มีจะคงเป็นไทย ไม่พัง
(function () {
  var D = {
  // ── แถบหัว / hero ──
  "วิธีใช้": "How it works",
  "ฟีเจอร์": "Features",
  "ราคา": "Pricing",
  "คำถาม": "FAQ",
  "ช่วยเหลือ": "Help",
  "เปิดแอป": "Open the app",
  "✦ ทริปหน้าไปไหน?": "✦ Where to next?",
  "วางแผนทริป": "Plan the trip,",
  "แล้วเก็บไว้เป็นเรื่องเล่า": "keep it as a story",
  "จัดแผนรายวัน จดงบทริป เก็บรูปกับโน้ตระหว่างทาง แล้วทุกอย่างเรียงตามวันเป็นเรื่องเล่าของทริปนั้นให้เอง": "Plan day by day, track the budget, collect photos and notes on the road — Vela lines it all up by day and turns it into the story of that trip.",
  "เปิดแอป ใช้ฟรี": "Open the app — free",
  "ดูวิธีใช้": "See how it works",
  "วางแผนและบันทึกฟรี · AI เป็นพรีเมียม": "Planning and journaling are free · AI is Premium",
  "ไม่ต้องโหลดจากสโตร์": "No app store needed",
  "ใหม่": "New",
  "Vela มีแอปบน App Store แล้ว — โหลดใช้บน iPhone ได้เลย": "Vela is on the App Store — get it on your iPhone",
  "ไปที่ App Store →": "Open App Store →",
  "ดาวน์โหลดบน": "Download on the",
  "บน App Store แล้ว · หรือใช้บนเว็บได้เลย": "On the App Store · or use it right in your browser",
  "หนังสือเต็มเล่ม · อ่านในแอป & บันทึก PDF ได้": "Full books · read in-app & save as PDF",
  "ออกเป็นไฟล์ EPUB อ่านใน Apple Books / Play Books": "Export as EPUB for Apple Books / Play Books",
  "รวมทั้งทริปเป็นหนังสือเต็มเล่ม เลือกกรอบรูป เลย์เอาต์ และธีมสีเองได้ เปิดอ่านแบบพลิกหน้า บันทึกเป็น PDF หรือออกเป็นไฟล์ EPUB สำหรับ Apple Books / Play Books": "Turn a whole trip into a full book — pick photo frames, layouts and colour themes, read it page by page, save it as a PDF, or export an EPUB for Apple Books / Play Books.",
  "โหลดไปใช้ได้เลย": "Get the app",
  "เก็บทุกทริปไว้ในเครื่องเดียว": "Every trip, in one place",
  "โหลดแอปบน iPhone หรือใช้บนเบราว์เซอร์ก็ได้ — ล็อกอินบัญชีเดียวกัน แผนกับเรื่องเล่าซิงก์ถึงกันหมด": "Get it on iPhone or use it in your browser — sign in with the same account and your plans and stories sync across both.",
  "ใช้บนเบราว์เซอร์": "Use it in your",
  "Android กำลังมา — ระหว่างนี้ใช้ Web App ได้เต็มที่ เพิ่มลงหน้าจอโฮมได้เหมือนแอป": "Android is on the way — until then the Web App does everything, and you can add it to your home screen like an app.",
  "โหลดแอป": "Get the app",
  "ใช้ออฟไลน์ได้": "Works offline",
  "ภาษาไทยเต็มระบบ พร้อมภาษาอังกฤษ": "Full Thai and English",

  // ── ภาพตัวอย่างในเครื่อง ──
  "วันนี้": "Today",
  "พฤหัสบดี 26 ก.ค.": "Thursday, Jul 26",
  "3 โมเมนต์": "3 moments",
  "1 เรื่องเล่า": "1 story",
  "ย้อนไป 1 ปี": "1 year ago",
  "ตอนนี้อยู่ที่": "You're at",
  "ร้านกาแฟริมน้ำ": "The café by the river",
  "เช็คอิน": "Check in",
  "โมเมนต์": "Moments",
  "อาหาร": "Food",
  "แวะร้านเล็กๆ ข้างทาง สั่งของกินมาแบ่งกันคนละครึ่ง ลมเย็นกำลังดี นั่งยาวจนแดดหมด": "Stopped at a small place by the road, split everything down the middle. The breeze was perfect — we stayed until the light went.",
  "ท่องเที่ยว": "Travel",
  "ออกเช้ากว่าที่คิด ถนนยังว่าง เดินดูตลาดจนครบทุกซอย": "Left earlier than planned, streets still empty, walked every lane of the market.",
  "แผนของฉัน": "My plans",
  "ฉัน": "Me",
  "บันทึกการเดินทาง": "Travel journal",
  "จบแล้ว": "Finished",
  "สิบเอ็ดวันที่ไม่ได้วางแผนไว้ทั้งหมด": "Eleven days we didn't plan all the way through",
  "อัปเดตล่าสุด 3 ส.ค.": "Updated Aug 3",
  "จัดการ": "Manage",
  "5 ตอน": "5 chapters",
  "ตั้งใจไว้ว่าจะไปตามแผนทุกวัน สุดท้ายวันที่ชอบที่สุดคือวันที่หลงทาง": "We meant to follow the plan every day. Our favourite day was the one we got lost.",
  "สารบัญ · 5 ตอน": "Contents · 5 chapters",
  "วันแรกที่ยังงงกับเวลา": "Day one, still lost in the time zone",
  "ตอนที่ 1 · 24 ก.ค.": "Chapter 1 · Jul 24",
  "ตลาดเช้าที่ไม่ได้อยู่ในแผน": "A morning market that wasn't in the plan",
  "ตอนที่ 2 · 26 ก.ค.": "Chapter 2 · Jul 26",
  "ขึ้นเขาแล้วเจอหมอก": "Up the mountain, into the fog",
  "ตอนที่ 3 · 28 ก.ค.": "Chapter 3 · Jul 28",

  // ── วิธีใช้ ──
  "เรื่องเล่าไม่ได้เริ่มตอนกลับบ้าน — มันเริ่มวันที่คุณวางแผน": "The story doesn't start when you get home — it starts the day you plan",
  "วางแผนรายวัน": "Plan day by day",
  "ใส่กิจกรรมทีละวัน เติมที่พักโดยกรอกวันเข้า–ออกครั้งเดียว แล้ว Vela เติมให้ทุกคืนเอง พร้อมจดงบทริปควบไปด้วย": "Add activities one day at a time. Enter check-in and check-out once and Vela fills in every night for you — with the trip budget alongside.",
  "เช็คอินระหว่างเที่ยว": "Check in as you travel",
  "ถึงที่ไหนก็เก็บรูป คลิป และโน้ตสั้นๆ ไว้ในวันนั้น ไม่ต้องเรียบเรียง — แค่บันทึกให้ทัน ระหว่างที่ยังรู้สึกอยู่": "Wherever you land, drop in photos, clips, and a short note on that day. No need to write it well — just catch it while you still feel it.",
  "กลับบ้านแล้วได้ของจริง": "Come home with something real",
  "Vela เรียงทุกโมเมนต์ตามวัน แล้วรวมออกมาเป็นหนังสือ โฟโต้บุ๊ก และคลิปสั้นสำหรับโพสต์ — ทำได้ฟรีทั้งหมด": "Vela orders every moment by day, then turns it into a book, a photo book, and a short clip to post — all free.",
  "โบนัส": "Bonus",
  "ใช้เป็นไดอารี่ก็ได้": "It works as a diary too",
  "ไม่มีทริปก็บันทึกได้ — จดวันธรรมดา ใส่รูปกับความรู้สึกลงไป Vela เก็บเรียงตามวันให้เหมือนไดอารี่ส่วนตัวที่ย้อนอ่านได้ทุกเมื่อ": "You don't need a trip to write. Log an ordinary day, add a photo and how it felt — Vela keeps it in order like a private diary you can reread anytime.",

  // ── ฟีเจอร์ ──
  "ครบตั้งแต่ก่อนไป จนถึงหลังกลับ": "Everything from before you go to after you're back",
  "Vela ทำงานบนมือถือเป็นหลัก เปิดจากหน้าจอโฮมได้เหมือนแอป และซิงก์ให้ทุกเครื่องที่ล็อกอินบัญชีเดียวกัน": "Vela is built for the phone first — open it from your home screen like an app, and it syncs to every device signed into the same account.",
  "แผนรายวัน + ที่พัก": "Daily plan + stays",
  "ไทม์ไลน์ต่อวัน แก้ไขได้ไว ใส่วันเข้า–ออกที่พักครั้งเดียว เติมให้ครบทุกคืนอัตโนมัติ": "A timeline per day, quick to edit. Enter a stay's dates once and every night is filled in automatically.",
  "งบทริป": "Trip budget",
  "ตั้งงบก่อนไป จดค่าใช้จ่ายจริงระหว่างทาง เห็นยอดคงเหลือทั้งทริปในที่เดียว": "Set a budget before you go, log real spending on the road, and see what's left for the whole trip in one place.",
  "โมเมนต์ & แกลเลอรี": "Moments & gallery",
  "รูป คลิป โน้ต ผูกกับวันและสถานที่ ดูรวมทั้งทริปได้ในแกลเลอรีเดียว": "Photos, clips, and notes tied to a day and a place — the whole trip in one gallery.",
  "แผนที่ทริป": "Trip map",
  "เห็นทุกจุดที่เช็คอินบนแผนที่ ย้อนดูเส้นทางที่เคยไปทั้งทริป": "Every check-in on a map, so you can retrace the whole route.",
  "AI ช่วยคิด & ช่วยเขียน": "AI to think and write with",
  "พรีเมียม": "Premium",
  "วางโปรแกรมทัวร์ให้ AI แยกเป็นแผนรายวัน ถามทางระหว่างเที่ยว หรือให้ช่วยร่างเรื่องเล่าจากโมเมนต์จริง — ไม่ต้องหา API key เอง ใช้ AI ของ Vela ได้เลย": "Paste an itinerary and AI splits it into days, ask it questions on the road, or let it draft the story from your real moments — no API key to find, Vela's AI is built in.",
  "รวมเป็นเล่ม": "Bind it into a book",
  "ทำได้ฟรี": "Free",
  "รวมทั้งทริปเป็นหนังสือหรือโฟโต้บุ๊ก เลือกกรอบรูป เลย์เอาต์ และธีมสีเองได้ เปิดอ่านแบบพลิกหน้าหรือบันทึกเป็น PDF ทั้งโหมดอ่านบนจอและโหมดสำหรับพิมพ์": "Turn the trip into a book or a photo book — choose the framing, the layout, and the colour theme. Read it page by page, or save a PDF in either screen or print mode.",
  "คลิปสรุปทริป": "Trip recap clip",
  "แอปเลือกรูปเด่นจากทั้งทริปมาต่อเป็นคลิปแนวตั้ง 45–60 วินาที ลง Reels หรือ TikTok ได้เลย ทำกี่ครั้งก็ได้": "Vela picks the best photos from the trip and cuts a 45–60 second vertical clip, ready for Reels or TikTok — as many times as you like.",
  "ซิงก์ & ออฟไลน์": "Sync & offline",
  "ข้อมูลอยู่ครบในเครื่องแม้เน็ตหลุด และซิงก์ขึ้นคลาวด์ให้ทุกเครื่องที่ล็อกอินบัญชีเดียวกัน": "Everything stays on your device even with no signal, then syncs to the cloud for every device on the same account.",

  // ── หลังกลับ ──
  "หลังกลับจากทริป": "After the trip",
  "ทริปที่จดไว้ กลายเป็นเล่มได้": "The trip you logged becomes a book",
  "รวมเป็น": "Bind it into a",
  "หนังสือ": "book",
  "ที่มีเรื่องเล่าเป็นตอน หรือ": "with chapters, or a",
  "โฟโต้บุ๊ก": "photo book",
  "ที่ให้รูปเล่าเรื่อง เลือกวางรูปในเรื่องเองได้ทีละใบ เปิดอ่านแบบพลิกหน้าในแอป หรือบันทึกเป็น PDF ไปสั่งพิมพ์ — ทำได้ฟรี ไม่จำกัดจำนวนครั้ง": "where the photos carry it. Place each photo in the text yourself, read it page by page in the app, or save a PDF and send it to a printer — free, as often as you like.",
  "ดูวิธีทำ →": "See how →",
  "อัลมาตี · 2569": "Almaty · 2026",
  "คาซัคสถาน": "Kazakhstan",
  "11 วัน": "11 days",

  // ── ราคา ──
  "เริ่มฟรี จ่ายเฉพาะเดือนที่ออกเดินทาง": "Start free, pay only in the months you travel",
  "ฟรี": "Free",
  "วางแผน บันทึก และทำเล่ม/คลิป ได้เต็มที่ ตลอดไป": "Plan, journal, and make books and clips in full — forever",
  "บาท": "THB",
  "ไม่มีวันหมดอายุ": "Never expires",
  "แผนรายวัน · ที่พัก · งบทริป": "Daily plans · stays · trip budget",
  "เช็คอิน รูป คลิป โน้ต": "Check-ins, photos, clips, notes",
  "เรื่องเล่า & แกลเลอรี": "Stories & gallery",
  "หนังสือ & โฟโต้บุ๊ก เต็มเล่ม · บันทึก PDF ได้": "Full books & photo books · save as PDF",
  "คลิปสรุปทริป 45–60 วิ · ทำกี่ครั้งก็ได้": "45–60 s recap clips · unlimited",
  "ใช้ออฟไลน์ · ล็อกอินแล้วสำรองแผนไว้ไม่ให้หาย": "Works offline · sign in and your plans are backed up",
  "สำรองเฉพาะข้อความ · รูปอยู่ในเครื่องนี้เท่านั้น": "Text-only backup · photos stay on this device",
  "ไม่มีผู้ช่วย AI": "No AI assistant",
  "เริ่มใช้ฟรี": "Start free",
  "แนะนำ": "Recommended",
  "เปิดใช้ AI · เอาชื่อ Vela ออกจากไฟล์ · ตัดต่อคลิปเอง": "Turn on AI · remove the Vela mark from exports · edit clips yourself",
  "บาท / 30 วัน": "THB / 30 days",
  "จ่ายเฉพาะเดือนที่ไปเที่ยว ไม่ตัดบัตรอัตโนมัติ · เที่ยวบ่อยเลือกรายปี 790 บาท": "Pay only for the months you travel — no automatic renewal · travel often? Yearly is ฿790",
  "ทุกอย่างในแพ็กฟรี": "Everything in Free",
  "AI แยกโปรแกรมทัวร์เป็นแผนรายวัน": "AI splits an itinerary into daily plans",
  "AI ช่วยร่างแผนวัน & ตอบระหว่างเที่ยว": "AI drafts days & answers on the road",
  "AI เรียบเรียงเรื่องเล่าจากโมเมนต์": "AI writes the story from your moments",
  "ไฟล์ที่โหลดออก": "Exports carry ",
  "ไม่มีชื่อ Vela": "no Vela mark",
  "ทั้งเล่มและคลิป": " in books and clips",
  "คลิป: เลือกรูปเอง เรียงเอง ยาวเท่าไหร่ก็ได้": "Clips: pick the photos, set the order, any length",
  "สำรองรูปขึ้นคลาวด์ & ซิงก์สดข้ามเครื่อง": "Photo backup to the cloud & live cross-device sync",
  "AI ใช้ได้ 60 ครั้ง/แพ็ก (รายปี 100 ครั้ง/เดือน)": "60 AI requests per pass (yearly: 100/month)",
  "อัปเกรดในแอป": "Upgrade in the app",

  // ── FAQ ──
  "คำถามที่พบบ่อย": "Frequently asked",
  "เรื่องที่มักถามกันก่อนเริ่มใช้": "What people ask before they start",
  "Vela คืออะไร?": "What is Vela?",
  "แอปวางแผนทริปรายวันที่บันทึกเรื่องราวไปพร้อมกัน — วางแผนก่อนไป เก็บโมเมนต์ตอนเที่ยว แล้วได้เรื่องเล่าของทริปนั้นเก็บไว้เมื่อกลับมา": "A day-by-day trip planner that journals as you go — plan before you leave, capture moments while you travel, and come home with the story of that trip.",
  "ต้องโหลดจาก App Store ไหม?": "Do I need the App Store?",
  "iPhone โหลดจาก App Store ได้เลย · หรือเปิดจากเว็บก็ใช้ได้ครบเหมือนกัน (Android ยังไม่มีในสโตร์ — กด “ติดตั้งแอป” ในเบราว์เซอร์จะได้ไอคอนเปิดเต็มจอ) —": "On iPhone, get it from the App Store · or just open it in the browser — everything works there too (Android isn’t in the store yet — tap \"Install app\" in your browser for a full-screen icon) —",
  "ดูคู่มือทีละขั้นพร้อมภาพ": "see the step-by-step guide with pictures",
  "ระหว่างเที่ยวเน็ตไม่มี ใช้ได้ไหม?": "Does it work without a connection?",
  "ใช้ได้ ทั้งดูแผนและบันทึกโมเมนต์ทำงานออฟไลน์ ข้อมูลเก็บในเครื่องก่อน แล้วซิงก์ขึ้นคลาวด์ให้เองเมื่อกลับมามีเน็ต": "Yes — viewing plans and saving moments both work offline. Data is kept on your device first, then syncs to the cloud when you're back online.",
  "ข้อมูลทริปของฉันอยู่ที่ไหน?": "Where does my trip data live?",
  "อยู่ในเครื่องคุณ และสำรองไว้ในบัญชีของคุณเองบนคลาวด์ ทริปเป็นส่วนตัวโดยค่าเริ่มต้น ดาวน์โหลดไฟล์สำรองเก็บไว้เองได้ทุกเมื่อ": "On your device, and backed up to your own account in the cloud. Trips are private by default, and you can download a backup file anytime.",
  "ใช้หลายเครื่องพร้อมกันได้ไหม?": "Can I use several devices?",
  "ได้ ล็อกอินบัญชีเดียวกันบนมือถือและคอมพิวเตอร์ แผนกับโมเมนต์จะซิงก์ให้อัตโนมัติ": "Yes — sign into the same account on phone and computer, and plans and moments sync automatically.",
  "ทำหนังสือกับคลิปได้ฟรีจริงไหม?": "Are books and clips really free?",
  "จริง ทำได้เต็มเล่มและเต็มคลิป ไม่จำกัดจำนวนครั้ง อ่านในแอปได้สะอาดไม่มีอะไรมาบัง สิ่งเดียวที่ต่างคือไฟล์ที่": "Really — full books and full clips, as many as you like, and they read clean in the app. The only difference is that files you",
  "โหลดออกไป": "export",
  "จะมีชื่อ Vela เล็กๆ อยู่มุมล่าง (คลิปมีหน้าปิดท้าย 2 วินาที) — พรีเมียมเอาออกให้": "carry a small Vela mark in the corner (clips get a 2-second end card) — Premium removes it.",
  "พรีเมียมได้อะไรเพิ่ม?": "What does Premium add?",
  "สี่อย่าง: ผู้ช่วย AI (แยกโปรแกรมทัวร์ ร่างแผนวัน เรียบเรียงเรื่องเล่า) · ไฟล์ที่โหลดออกไม่มีชื่อ Vela ทั้งเล่มและคลิป · ออกเล่มเป็นไฟล์ EPUB สำหรับ Apple Books / Play Books (อ่านในแอปและบันทึก PDF ยังฟรี) · เลือกรูปและเรียงลำดับคลิปเอง ยาวเท่าไหร่ก็ได้ — บวกกับสำรองรูปขึ้นคลาวด์และซิงก์ข้ามเครื่อง": "Four things: the AI assistant (split a tour itinerary, draft day plans, write up your stories) · downloads carry no Vela mark, in books and clips · export your book as an EPUB for Apple Books / Play Books (reading in-app and saving a PDF stay free) · pick and reorder clip photos yourself, any length — plus photo backup to the cloud and sync across devices",
  "จ่ายแล้วต้องต่ออัตโนมัติไหม?": "Does it renew automatically?",
  "แบบ 30 วันคือจ่ายครั้งเดียว หมดแล้วหมดเลย ไม่ตัดเงินซ้ำ ส่วนแบบรายปีต่ออัตโนมัติ ยกเลิกได้ทุกเมื่อในหน้า “ฉัน” — ใช้ต่อได้จนหมดรอบที่จ่ายไปแล้ว": "The 30-day pass is a one-time payment that simply ends — no repeat charge. The yearly plan renews and can be cancelled anytime under \"Me\", and you keep access to the end of the period you paid for.",
  "เจอปัญหาหรืออยากถามอะไร ติดต่อยังไง?": "How do I get in touch?",
  "ในแอปไปที่แท็บ “ฉัน” → ช่วยเหลือ & ติดต่อเรา เขียนมาได้เลย หรือส่งอีเมลมาที่ admin@onevela.net — เราตอบกลับทางอีเมลภายใน 1–2 วัน": "In the app, go to the \"Me\" tab → Help & contact and write to us, or email admin@onevela.net — we reply by email within 1–2 days.",
  "ดูคำถามทั้งหมดและคู่มือใช้งานได้ที่": "All questions and guides are in the",
  "ศูนย์ช่วยเหลือ": "help centre",
  "· หรือส่งมาที่": "· or write to",

  // ── ปิดท้าย / จอง / ฟุตเตอร์ ──
  "ทริปหน้าจะไปไหน เริ่มวางแผนได้เลย": "Where to next? Start planning",
  "สร้างทริปแรกใช้เวลาไม่ถึงนาที ไม่ต้องติดตั้งอะไรก่อน": "Your first trip takes under a minute, with nothing to install",
  "เปิด Vela": "Open Vela",
  "จองต่อได้ในแอป": "Book right from the app",
  "วางแผนเสร็จแล้วกดจองที่พัก ทัวร์ และตั๋วได้เลย ไม่ต้องออกไปหาที่อื่น": "Once the plan is set, book stays, tours, and tickets without leaving Vela",
  "ที่พัก": "Stays",
  "ตั๋วเครื่องบิน": "Flights",
  "ทัวร์ & บัตรเข้า": "Tours & tickets",
  "รถไฟ & รถรับส่ง": "Trains & transfers",
  "Vela ได้รับค่าตอบแทนจากการจองผ่านลิงก์พาร์ทเนอร์ โดยราคาที่คุณจ่ายเท่าเดิม": "Vela earns a commission on bookings made through partner links, at no extra cost to you.",
  "ทริปหน้าไปไหน": "where to next?",
  "ความเป็นส่วนตัว": "Privacy",
  "ติดต่อ": "Contact",
  "เพจ Facebook": "Facebook page",

  // ── alt ──
  "ตัวอย่างหน้าจอวันนี้ในแอป Vela": "The Today screen in the Vela app",
  "ตัวอย่างหน้าจอเรื่องเล่าในแอป Vela": "A story screen in the Vela app",
  "ตัวอย่างโฟโต้บุ๊กจากทริป": "A photo book made from a trip",
  "ตัวอย่างหนังสือจากทริป": "A book made from a trip"
};
  window.VELA_WEB_EN = D;

  // ── ภาษา ──
  function pick() {
    var v = null;
    try { v = localStorage.getItem('vela-web-lang'); } catch (e) {}
    if (v === 'th' || v === 'en') return v;
    var nav = '';
    try { nav = (navigator.language || (navigator.languages || [])[0] || '').toLowerCase(); } catch (e) {}
    return nav.indexOf('th') === 0 ? 'th' : 'en';
  }
  var LANG = pick();
  window.VELA_WEB_LANG = LANG;

  function setLang(l) {
    var v = l === 'en' ? 'en' : 'th';
    if (v === LANG) return;
    try { localStorage.setItem('vela-web-lang', v); } catch (e) {}
    location.reload();
  }

  // ── ปุ่มสลับ ──
  function btnStyle(on) {
    return 'border:none;cursor:pointer;border-radius:999px;padding:7px 13px;min-height:34px;' +
      "font:600 13.5px 'Anuphan',system-ui,sans-serif;background:" + (on ? '#fffaf0' : 'transparent') +
      ';color:' + (on ? '#c05f39' : '#8a7d6f') + ';box-shadow:' + (on ? '0 1px 4px rgba(43,36,32,.14)' : 'none');
  }
  function mountSwitch() {
    var built = document.querySelector('[data-vela-lang-built]');
    var slot = document.querySelector('[data-vela-lang-switch]');
    if (built) {
      // ถ้าตอนแรกยังไม่มีที่วางในแถบหัว (เนื้อหายังสตรีมไม่ถึง) แล้วเพิ่งมี → ย้ายเข้าไป
      if (built.getAttribute('data-vela-fixed') && slot && slot !== built) built.parentNode.removeChild(built);
      else return;
    }
    var host = slot;
    var fixed = false;
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('style', 'position:fixed;top:10px;right:12px;z-index:99;background:rgba(246,239,226,.94);' +
        'backdrop-filter:blur(8px);border:1px solid rgba(43,36,32,.1);border-radius:999px;padding:3px;display:flex;gap:3px;' +
        'box-shadow:0 4px 14px -6px rgba(43,36,32,.3)');
      document.body.appendChild(host);
      fixed = true;
    } else {
      host.setAttribute('style', (host.getAttribute('style') || '') +
        ';display:flex;gap:3px;background:rgba(43,36,32,.06);border-radius:999px;padding:3px;flex:none');
    }
    host.setAttribute('data-no-i18n', '1');
    host.setAttribute('data-vela-lang-built', '1');
    if (fixed) host.setAttribute('data-vela-fixed', '1');
    [['th', 'ไทย'], ['en', 'EN']].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = p[1];
      b.setAttribute('style', btnStyle(LANG === p[0]));
      b.addEventListener('click', function () { setLang(p[0]); });
      host.appendChild(b);
    });
  }

  // ── แปลตอนแสดงผล ──
  var THAI = /[\u0E00-\u0E7F]/;
  function tr(n) {
    if (!n || !n.nodeValue) return;
    var p = n.parentNode;
    if (p && (p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE')) return;
    if (p && p.closest && p.closest('[data-no-i18n]')) return;
    var v = n.nodeValue;
    if (!THAI.test(v)) return;
    var t = v.trim();
    if (!t) return;
    var en = D[t];
    if (en !== undefined && en !== t) n.nodeValue = v.replace(t, en);
  }
  function sweep(root) {
    if (!root) return;
    if (root.nodeType === 3) { tr(root); return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var hits = [], n;
    while ((n = w.nextNode())) hits.push(n);
    hits.forEach(tr);
    var A = ['alt', 'aria-label', 'title', 'placeholder'];
    Array.prototype.forEach.call(root.querySelectorAll('[alt],[aria-label],[title],[placeholder]'), function (el) {
      A.forEach(function (a) {
        var v = el.getAttribute(a);
        if (!v || !THAI.test(v)) return;
        var en = D[v.trim()];
        if (en !== undefined) el.setAttribute(a, en);
      });
    });
  }

  var observed = false;
  function fixTitle() {
    if (LANG !== 'en') return;
    var D2 = window.VELA_WEB_EN || {};
    var ti = D2['__title__' + (location.pathname.split('/').pop() || 'index.html')];
    var t2 = D2[(document.title || '').trim()];
    if (ti) document.title = ti;
    else if (t2) document.title = t2;
  }
  function boot() {
    mountSwitch();
    fixTitle();
    if (LANG !== 'en' || observed) return;
    observed = true;
    try {
      document.documentElement.lang = 'en';
      var ti = D['__title__' + (location.pathname.split('/').pop() || 'index.html')];
      var t2 = D[(document.title || '').trim()];
      if (ti) document.title = ti;
      else if (t2) document.title = t2;
    } catch (e) {}
    sweep(document.body);
    new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        if (r.type === 'characterData') tr(r.target);
        else Array.prototype.forEach.call(r.addedNodes, sweep);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  // เผื่อเนื้อหาสตรีมมาหลัง DOMContentLoaded (Design Component)
  setTimeout(boot, 400);
})();

Object.assign(window.VELA_WEB_EN, {
  "__title__index.html": "Vela · where to next? — plan the trip, keep it as a story",
  "__title__privacy.html": "Privacy policy · Vela",
  "__title__help.html": "Vela Help Centre · guides and FAQ",
  "นโยบายความเป็นส่วนตัว · Vela": "Privacy policy · Vela",
  "กลับหน้าแรก": "Back to home",
  "นโยบายความเป็นส่วนตัว": "Privacy policy",
  "เรื่องเล่าของคุณ เป็นของคุณ": "Your stories are yours",
  "Vela (“เรา”) เป็นแอปวางแผนทริปและบันทึกการเดินทาง ดำเนินการโดยผู้พัฒนาอิสระในประเทศไทย หน้านี้อธิบายว่าเราเก็บข้อมูลอะไร เก็บไว้ทำอะไร และคุณจัดการหรือลบได้อย่างไร": "Vela (\"we\") is a trip-planning and travel-journalling app run by an independent developer in Thailand. This page explains what we collect, what we use it for, and how you can manage or delete it.",
  "มีผลตั้งแต่ 26 สิงหาคม 2569 · ปรับปรุงล่าสุด 26 สิงหาคม 2569": "Effective 26 August 2026 · last updated 26 August 2026",
  "สรุปสั้น ๆ": "In short",
  "เราไม่ขายข้อมูลของคุณ และไม่ส่งข้อมูลให้ใครเพื่อการโฆษณา": "We don't sell your data, and we don't share it with anyone for advertising.",
  "ทริป โมเมนต์ และเรื่องเล่าเก็บไว้ในเครื่องคุณก่อน แล้วสำรองขึ้นคลาวด์เมื่อคุณล็อกอิน": "Trips, moments, and stories are kept on your device first, then backed up to the cloud when you sign in.",
  "ทุกอย่างเป็นส่วนตัวโดยค่าเริ่มต้น — เผยแพร่สาธารณะเฉพาะตอนที่คุณกดเผยแพร่เอง": "Everything is private by default — nothing goes public unless you publish it yourself.",
  "ไม่มีเครื่องมือติดตามโฆษณา ไม่มี ad SDK ไม่มี analytics แบบรายบุคคล": "No ad trackers, no ad SDKs, no per-person analytics.",
  "ลบบัญชีได้ในแอป — ข้อมูลบนคลาวด์ถูกลบตามไปด้วย": "You can delete your account in the app — your cloud data goes with it.",
  "1. ข้อมูลที่เราเก็บ": "1. What we collect",
  "เราเก็บเท่าที่แอปต้องใช้จริงเพื่อทำงาน ไม่มีการเก็บเผื่อไว้": "We collect only what the app genuinely needs to work — nothing \"just in case\".",
  "บัญชีผู้ใช้": "Your account",
  "อีเมล และชื่อที่คุณตั้งเอง (ถ้าล็อกอินด้วย Google เราได้รับอีเมล ชื่อ และรูปโปรไฟล์จาก Google) ใช้เพื่อยืนยันตัวตนและซิงก์ข้อมูลข้ามเครื่อง ·": "Your email and the display name you choose (if you sign in with Google, we receive your email, name, and profile photo from Google). Used to authenticate you and sync across devices ·",
  "จำเป็นต่อการใช้คลาวด์ ไม่จำเป็นถ้าใช้แบบออฟไลน์": "required for cloud use, not needed offline",
  "เนื้อหาที่คุณสร้าง": "What you create",
  "ทริป แผนรายวัน งบและค่าใช้จ่ายที่คุณจด โมเมนต์ ข้อความ รูปภาพ และเรื่องเล่า · เก็บในเครื่องเสมอ และสำรองขึ้นคลาวด์เมื่อคุณล็อกอิน เพื่อกู้คืนและใช้หลายเครื่อง": "Trips, daily plans, budgets and spending you log, moments, text, photos, and stories · always kept on your device, and backed up to the cloud when you sign in so you can restore them and use several devices.",
  "รูปภาพ": "Photos",
  "เฉพาะรูปที่คุณเลือกใส่โมเมนต์หรือเรื่องเล่าเท่านั้น เราไม่อ่านคลังรูปทั้งเครื่อง และไม่สแกนรูปที่คุณไม่ได้เลือก · รูปถูกย่อขนาดในเครื่องก่อนอัปโหลด": "Only the photos you choose to add to a moment or story. We don't read your whole gallery and we don't scan photos you didn't pick · photos are resized on your device before upload.",
  "ตำแหน่งที่ตั้ง": "Location",
  "— ไม่บังคับ": "— optional",
  "ใช้เมื่อคุณกดเช็กอิน ปักหมุดโมเมนต์บนแผนที่ หรือกดปุ่มหาตำแหน่งฉันเท่านั้น · เราไม่ติดตามตำแหน่งเบื้องหลัง ปฏิเสธสิทธิ์นี้แล้วแอปยังใช้งานได้ครบทุกอย่างที่เหลือ": "Used only when you check in, pin a moment on the map, or tap \"my location\" · we never track location in the background, and declining the permission leaves everything else working.",
  "การชำระเงิน": "Payments",
  "ถ้าคุณสมัครแพ็กเกจพรีเมียม การชำระเงินดำเนินการโดย Stripe ทั้งหมด ·": "If you subscribe to Premium, payment is handled entirely by Stripe ·",
  "เราไม่เห็นและไม่เก็บเลขบัตรของคุณ": "we never see or store your card number",
  "เราเก็บเพียงสถานะแพ็กเกจ วันหมดอายุ และรหัสอ้างอิงรายการ": "We keep only your plan status, expiry date, and a transaction reference.",
  "เรื่องที่คุณแจ้งเข้ามา": "Support requests",
  "ข้อความ อีเมลติดต่อกลับ และ (เมื่อคุณติ๊กยินยอมเท่านั้น) ข้อมูลเครื่องพื้นฐาน เช่น รุ่นเบราว์เซอร์และเวอร์ชันแอป เพื่อไล่หาสาเหตุปัญหา": "Your message, a reply-to email, and — only if you tick the box — basic device info such as browser version and app version, to help track down the problem.",
  "เราไม่เก็บ: รายชื่อผู้ติดต่อ ปฏิทิน ไมโครโฟน ประวัติการใช้แอปอื่น รายการติดตั้ง หรือรหัสโฆษณา (advertising ID)": "We do not collect: contacts, calendars, microphone, your activity in other apps, installed-app lists, or advertising IDs.",
  "2. ใช้ทำอะไร": "2. What we use it for",
  "ให้แอปทำงานตามที่คุณสั่ง (บันทึก ซิงก์ กู้คืน แสดงแผนที่) · เผยแพร่เรื่องเล่าเมื่อคุณกดเผยแพร่ · ตอบเรื่องที่คุณแจ้งเข้ามา · จัดการแพ็กเกจพรีเมียม · แก้บั๊กและปรับปรุงแอปจากภาพรวมการใช้งานที่ไม่ระบุตัวบุคคล": "Running the app as you ask it to (saving, syncing, restoring, showing maps) · publishing a story when you publish it · answering your support requests · managing Premium plans · fixing bugs and improving the app from aggregate, non-identifying usage.",
  "เราไม่ใช้ข้อมูลของคุณเพื่อโฆษณา ไม่สร้างโปรไฟล์การตลาด และไม่ขายให้บุคคลที่สาม": "We don't use your data for advertising, build marketing profiles, or sell it to third parties.",
  "3. ฟีเจอร์ AI": "3. AI features",
  "เมื่อคุณกดใช้ผู้ช่วย AI (เช่น ช่วยเรียบเรียงเรื่องเล่า หรือแนะนำแผน) เฉพาะข้อความที่จำเป็นสำหรับคำสั่งนั้นจะถูกส่งไปยังผู้ให้บริการโมเดลภาษา (Google Gemini) ผ่านเซิร์ฟเวอร์ของเรา แล้วส่งผลลัพธ์กลับมา · เราไม่ส่งข้อมูลของคุณไปเทรนโมเดล และจะไม่ส่งอะไรเลยถ้าคุณไม่กดใช้ฟีเจอร์นี้ · ถ้าคุณใส่คีย์ API ของคุณเอง คีย์นั้นเก็บอยู่ในเครื่องคุณเท่านั้น": "When you use the AI assistant (to write a story, or suggest a plan), only the text needed for that request is sent to the language-model provider (Google Gemini) through our server, and the result is sent back · we don't send your data for model training, and nothing is sent at all unless you use the feature · if you supply your own API key, that key stays on your device only.",
  "4. ผู้ให้บริการที่เราใช้": "4. Services we use",
  "— ฐานข้อมูล ระบบล็อกอิน และที่เก็บไฟล์รูป": "— database, sign-in, and photo storage",
  "— ล็อกอินด้วยบัญชี Google (ไม่บังคับ) และผู้ให้บริการโมเดล AI": "— Google sign-in (optional) and the AI model provider",
  "— รับชำระเงินแพ็กเกจพรีเมียม": "— Premium payments",
  "— เสิร์ฟหน้าเว็บและไฟล์แอป": "— serving the website and app files",
  "— ภาพแผนที่": "— map tiles",
  "ผู้ให้บริการเหล่านี้อาจประมวลผลข้อมูลบนเซิร์ฟเวอร์นอกประเทศไทย เราส่งให้เท่าที่จำเป็นต่อการทำงานเท่านั้น · ลิงก์จองที่พัก/ทัวร์ในแอปเป็นลิงก์แอฟฟิลิเอต เมื่อคุณกด คุณจะออกไปที่เว็บพาร์ตเนอร์และอยู่ภายใต้นโยบายของเว็บนั้น เราได้รับเพียงรายงานยอดรวม ไม่ได้รับข้อมูลระบุตัวคุณ": "These providers may process data on servers outside Thailand; we send only what the app needs to work · booking links in the app are affiliate links — tapping one takes you to the partner's site under their policy, and we receive only aggregate reports, never information identifying you.",
  "5. อะไรเป็นสาธารณะ": "5. What's public",
  "ทริป แผน งบ และโมเมนต์เป็นส่วนตัวเสมอ · เรื่องเล่าหรือโมเมนต์จะเห็นได้โดยคนอื่นเฉพาะเมื่อคุณกด “เผยแพร่” เท่านั้น เมื่อเผยแพร่แล้ว ชื่อผู้เขียน รูปโปรไฟล์ เนื้อหา รูปภาพ และจำนวนถูกใจ/ยอดอ่านของตอนนั้นจะแสดงสาธารณะ · เลิกเผยแพร่หรือลบได้ทุกเมื่อในแอป": "Trips, plans, budgets, and moments are always private · a story or moment is only visible to others when you tap \"Publish\". Once published, the author name, profile photo, content, photos, and that chapter's likes and views are public · you can unpublish or delete it anytime in the app.",
  "6. เก็บนานแค่ไหน": "6. How long we keep it",
  "เราเก็บข้อมูลไว้เท่าที่บัญชีของคุณยังใช้งานอยู่ · ไฟล์สำรองย้อนหลังเก็บไว้ไม่กี่เวอร์ชันล่าสุดเพื่อกู้คืนเวลาเกิดปัญหา · เมื่อคุณลบบัญชี ข้อมูลทั้งหมดในคลาวด์ (ทริป โมเมนต์ เรื่องเล่า รูป และไฟล์สำรอง) จะถูกลบภายใน 30 วัน ยกเว้นบันทึกรายการชำระเงินที่ต้องเก็บตามกฎหมายบัญชี": "We keep your data as long as your account is active · a few recent backup versions are retained so you can restore after a problem · when you delete your account, all cloud data (trips, moments, stories, photos, and backups) is deleted within 30 days, except payment records we must keep for accounting law.",
  "7. สิทธิ์ของคุณ": "7. Your rights",
  "ดูและแก้": "View and edit",
  "— ข้อมูลทุกอย่างของคุณอยู่ในแอป แก้หรือลบได้เอง": "— everything of yours is in the app; edit or delete it yourself",
  "ดาวน์โหลด": "Download",
  "— ส่งออกข้อมูลทั้งหมดเป็นไฟล์ได้ที่แท็บ “ฉัน” → สำรองข้อมูล": "— export everything as a file from the \"Me\" tab → Backup",
  "ลบบัญชี": "Delete your account",
  "— แท็บ “ฉัน” → ลบบัญชี หรืออีเมลมาหาเรา": "— \"Me\" tab → Delete account, or email us",
  "ถอนความยินยอม": "Withdraw consent",
  "— ปิดสิทธิ์ตำแหน่งหรือรูปได้ในตั้งค่าของเครื่องเมื่อไหร่ก็ได้": "— turn off location or photo permissions in your device settings anytime",
  "มีคำถามหรืออยากใช้สิทธิ์ข้างต้น ส่งมาที่": "For questions or to exercise any of these rights, write to",
  "เราตอบภายใน 30 วัน (ปกติ 1–2 วัน)": "We respond within 30 days (usually 1–2).",
  "8. ความปลอดภัย": "8. Security",
  "การเชื่อมต่อทั้งหมดเข้ารหัสด้วย HTTPS · ฐานข้อมูลใช้กฎความปลอดภัยระดับแถว (Row Level Security) ที่อนุญาตให้เจ้าของข้อมูลเท่านั้นอ่านหรือเขียนข้อมูลส่วนตัวของตัวเอง · ไม่มีระบบใดปลอดภัย 100% หากเกิดเหตุข้อมูลรั่วไหลที่กระทบคุณ เราจะแจ้งทางอีเมลโดยไม่ชักช้า": "All connections are encrypted with HTTPS · the database uses Row Level Security so only the owner can read or write their own private data · no system is 100% secure, and if a breach affects you we will notify you by email without delay.",
  "9. เด็กและเยาวชน": "9. Children",
  "Vela ไม่ได้ออกแบบมาสำหรับเด็กอายุต่ำกว่า 13 ปี และเราไม่เก็บข้อมูลจากเด็กโดยเจตนา หากพบว่ามีบัญชีของเด็กอายุต่ำกว่าเกณฑ์ กรุณาแจ้งเรา เราจะลบให้": "Vela isn't designed for children under 13 and we don't knowingly collect their data. If you find an under-age account, tell us and we'll remove it.",
  "10. การเปลี่ยนแปลงนโยบาย": "10. Changes to this policy",
  "ถ้าเราแก้นโยบายนี้ เราจะอัปเดตวันที่ด้านบน และถ้าเป็นการเปลี่ยนแปลงที่มีนัยสำคัญ เราจะแจ้งในแอปก่อนมีผลบังคับใช้": "If we change this policy we'll update the date above, and for significant changes we'll tell you in the app before they take effect.",
  "ติดต่อเรา": "Contact us",
  "Vela · ผู้ควบคุมข้อมูล: ผู้พัฒนา Vela (ประเทศไทย)": "Vela · data controller: the Vela developer (Thailand)",
  "อีเมล": "Email",
  "· เว็บไซต์": "· website",
  "หน้าแรก": "Home",
  "ช่วยเหลือ": "Help",
  "ติดต่อ": "Contact",
  "ศูนย์ช่วยเหลือ Vela · คู่มือและคำถามที่พบบ่อย": "Vela Help Centre · guides and FAQ",
  "ศูนย์ช่วยเหลือ": "Help centre",
  "ไม่แน่ใจว่าเริ่มตรงไหน?": "Not sure where to start?",
  "Vela ทำได้หลายอย่างตั้งแต่วางแผนก่อนไปจนถึงทำเป็นเล่มหลังกลับ — หน้านี้รวมคู่มือทีละเรื่องกับคำตอบของคำถามที่ถามกันบ่อยไว้ที่เดียว เลือกหัวข้อที่อยากรู้ได้เลย": "Vela covers everything from planning before you leave to binding a book when you're back. This page gathers the step-by-step guides and the questions people ask most — pick whatever you need.",
  "คู่มือทีละขั้น": "Step-by-step guides",
  "5 เรื่อง": "5 guides",
  "ติดตั้ง Vela ลงหน้าจอโฮม": "Install Vela on your home screen",
  "iPhone และ Android ทีละขั้น พร้อมภาพประกอบ · ไม่ถึง 1 นาที": "iPhone and Android step by step, with pictures · under a minute",
  "สร้างทริปแรก แล้ววางแผนรายวัน": "Create your first trip and plan it day by day",
  "ตั้งชื่อทริป ใส่ช่วงวันกับงบ เพิ่มกิจกรรมรายวัน และใส่ที่พักครั้งเดียวให้ครบทุกคืน": "Name the trip, set the dates and budget, add activities per day, and fill every night with one stay entry",
  "ใส่ที่พักและคุมงบทริป": "Add stays and keep the budget",
  "กรอกที่พักครั้งเดียวเติมครบทุกคืน · ตั้งงบ จดรายจ่าย ตั้งอัตราแลกเปลี่ยน": "One stay entry fills every night · set a budget, log spending, set an exchange rate",
  "เช็คอินและเก็บโมเมนต์": "Check in and capture moments",
  "ปักหมุดตำแหน่ง แนบรูป จดโน้ต และวิธีจดย้อนหลังจากวันเวลาในรูป": "Pin a location, attach photos, write notes — and log things later using the photo's own timestamp",
  "ทำโฟโต้บุ๊กและอีบุ๊กจากทริป": "Make a photo book or an ebook from a trip",
  "สองแบบต่างกันอย่างไร ทำทีละขั้น และเคล็ดลับใส่รูปให้เล่มออกมาสวย": "How the two differ, the steps, and tips for placing photos so the book looks good",
  "อยากอ่านเรื่องอะไรต่อ": "What should we write next?",
  "บอกหัวข้อที่ยังติดอยู่มาได้ที่": "Tell us what you're stuck on at",
  "หรือคอมเมนต์ในเพจ แล้วเราจะเขียนเพิ่มให้": "or comment on our page, and we'll write it up",
  "แตะหัวข้อเพื่ออ่านคำตอบ": "Tap a question to see the answer",
  "เริ่มต้นใช้งาน": "Getting started",
  "Vela คืออะไร ใช้ทำอะไรได้": "What is Vela, and what can it do?",
  "แอปวางแผนทริปรายวันที่บันทึกเรื่องราวไปพร้อมกัน — วางแผนก่อนไป เก็บรูปกับโน้ตตอนเที่ยว แล้วกลับมาบ้านได้ทริปนั้นเป็นเรื่องเล่าและรวมเป็นหนังสือหนึ่งเล่มเก็บไว้": "A day-by-day trip planner that journals as you go — plan before you leave, collect photos and notes while you travel, and come home with that trip as a story you can bind into a book.",
  "ต้องโหลดจาก App Store ไหม": "Do I need the App Store?",
  "ไม่ต้อง เปิด onevela.net ใช้ได้เลย ถ้าอยากได้ไอคอนเปิดเต็มจอเหมือนแอปจริง ทำตาม": "No — just open onevela.net. For a full-screen icon like a real app, follow the",
  "คู่มือติดตั้งลงหน้าจอโฮม": "home-screen install guide",
  "ใช้เวลาไม่ถึงนาที": "it takes under a minute",
  "ต้องสมัครบัญชีก่อนใช้ไหม": "Do I need an account?",
  "ต้องสมัครก่อนครับ ใช้อีเมลกับรหัสผ่าน สมัครฟรีและใช้เวลาไม่ถึงนาที — เพราะแผนทริปของคุณจะถูกสำรองไว้ในบัญชี เปลี่ยนเครื่องหรือเปลี่ยนเบราว์เซอร์ก็ไม่หาย (ถ้ามีคนแชร์ลิงก์เรื่องเล่ามาให้อ่าน อ่านได้เลยโดยไม่ต้องสมัคร)": "Yes — an email and password, free, under a minute. It means your plans are backed up to your account, so changing device or browser doesn't lose them. (If someone shares a story link with you, you can read it without signing up.)",
  "ย้ำอีกครั้ง:": "Worth repeating:",
  "บัญชีฟรีสำรองเฉพาะ": "a free account backs up",
  "ข้อความ": "text only",
  "(แผน เช็คอิน โน้ต งบ เรื่องเล่า) —": "(plans, check-ins, notes, budget, stories) —",
  "รูปไม่ได้สำรองขึ้นคลาวด์": "photos are not backed up to the cloud",
  "อยู่ในเครื่องนี้เท่านั้น — แต่โหลดไฟล์สำรองแบบ “รวมรูป” เก็บไว้เองได้ (แท็บ “ฉัน”) หรือใช้พรีเมียมให้รูปขึ้นคลาวด์อัตโนมัติ": "they stay on this device — but you can download a \"with photos\" backup yourself (\"Me\" tab), or use Premium to have photos go to the cloud automatically.",
  "ระหว่างเที่ยว": "On the road",
  "เน็ตไม่มี ใช้ได้ไหม": "Does it work with no connection?",
  "ใช้ได้ ทั้งดูแผนและบันทึกโมเมนต์ทำงานออฟไลน์ ข้อมูลเก็บในเครื่องก่อน แล้วซิงก์ขึ้นคลาวด์ให้เองเมื่อกลับมามีเน็ต (บัญชีฟรีซิงก์เฉพาะข้อความ รูปที่ถ่ายไว้ยังอยู่ในเครื่อง)": "Yes — viewing plans and saving moments both work offline. Data is stored on the device first, then syncs when you're back online. (Free accounts sync text only; the photos you took stay on the device.)",
  "ใช้หลายเครื่องพร้อมกันได้ไหม": "Can I use several devices?",
  "บัญชีฟรี: รูปไม่ซิงก์ตามไปเอง": "Free accounts: photos don't follow automatically",
  "— เครื่องที่สองจะเห็นโมเมนต์ ชื่อสถานที่ และโน้ตครบ แต่ช่องรูปว่าง · ย้ายรูปเองได้โดยไปที่แท็บ “ฉัน” → ดาวน์โหลดไฟล์สำรอง → เลือก": "— the second device sees every moment, place, and note, but the photo slots are empty · to move them yourself, go to the \"Me\" tab → Download backup → choose",
  "แล้วนำเข้าไฟล์นั้นในเครื่องใหม่ · พรีเมียมรูปตามไปทุกเครื่องอัตโนมัติ": "then import that file on the new device · with Premium, photos follow everywhere automatically.",
  "ข้อมูลและความเป็นส่วนตัว": "Data & privacy",
  "ข้อมูลทริปของฉันอยู่ที่ไหน": "Where does my trip data live?",
  "อยู่ในเครื่องคุณ และสำรองไว้ในบัญชีของคุณเองบนคลาวด์ ทริปเป็นส่วนตัวโดยค่าเริ่มต้น ดาวน์โหลดไฟล์สำรองเก็บไว้เองได้ทุกเมื่อในแท็บ “ฉัน”": "On your device, and backed up to your own cloud account. Trips are private by default, and you can download a backup anytime from the \"Me\" tab.",
  "บัญชีฟรีสำรองเฉพาะข้อความ": "Free accounts back up text only",
  "— แผน เช็คอิน โน้ต งบ เรื่องเล่า เปลี่ยนเครื่องแล้วได้กลับครบ แต่": "— plans, check-ins, notes, budget, and stories all come back on a new device, but",
  "รูปยังอยู่ในเครื่องนี้เท่านั้น": "photos stay on this device only",
  "ถ้าลบแอปหรือล้างข้อมูลเบราว์เซอร์รูปจะหาย · พรีเมียมสำรองรูปขึ้นคลาวด์ให้ด้วย": "so deleting the app or clearing browser data loses them · Premium backs photos up to the cloud too.",
  "ราคาและพรีเมียม": "Pricing & Premium",
  "อะไรฟรี อะไรต้องจ่าย": "What's free, what's paid?",
  "ใช้ฟรีตลอด: วางแผนรายวัน ที่พัก งบทริป เช็คอิน รูป โน้ต เรื่องเล่า และ": "Free forever: daily planning, stays, trip budget, check-ins, photos, notes, stories, and",
  "การรวมเป็นโฟโต้บุ๊ก/หนังสือ กับคลิปสรุปทริป": "binding photo books and books, plus recap clips",
  "(บันทึก PDF ได้ ไม่จำกัดจำนวนครั้ง) · พรีเมียมคือ ผู้ช่วย AI · เอาบรรทัด “สร้างด้วย Vela” ออกจากไฟล์ที่โหลดออก · เลือกรูปและเรียงลำดับคลิปเอง · สำรองรูปขึ้นคลาวด์ — ดูรายละเอียดที่": "(save as PDF, unlimited) · Premium adds the AI assistant · removes the \"Made with Vela\" line from exports · lets you pick and order clip photos yourself · backs photos up to the cloud — details on the",
  "หน้าราคา": "pricing page",
  "“สร้างด้วย Vela” ในไฟล์คืออะไร": "What is the \"Made with Vela\" line?",
  "บัญชีฟรีทำเล่มและคลิปได้เต็มที่ อ่านหรือดูในแอปก็สะอาดไม่มีอะไรมาบัง แต่ไฟล์ที่": "Free accounts make full books and clips, and they read and play clean in the app. Only files you",
  "จะมีบรรทัดเล็กๆ “สร้างด้วย Vela · onevela.net” มุมล่างของหน้าเนื้อหา และคลิปมีหน้าปิดท้าย 2 วินาที — พรีเมียมเอาออกให้ทั้งสองอย่าง": "carry a small \"Made with Vela · onevela.net\" line at the bottom of content pages, and clips get a 2-second end card — Premium removes both.",
  "จ่ายแล้วต้องต่ออัตโนมัติไหม": "Does it renew automatically?",
  "แบบ 30 วันคือจ่ายครั้งเดียว หมดแล้วหมดเลย ไม่ตัดเงินซ้ำ ส่วนแบบรายปีต่ออัตโนมัติ ยกเลิกได้ทุกเมื่อในหน้า “ฉัน” และใช้ต่อได้จนหมดรอบที่จ่ายไปแล้ว": "The 30-day pass is a one-time payment that simply ends — no repeat charge. The yearly plan renews, can be cancelled anytime under \"Me\", and stays active to the end of the period you paid for.",
  "ยังไม่เจอคำตอบ?": "Still stuck?",
  "ในแอปไปที่แท็บ “ฉัน” → ช่วยเหลือ & ติดต่อเรา เขียนมาได้เลย หรือส่งอีเมลมาที่": "In the app, go to the \"Me\" tab → Help & contact and write to us, or email",
  "— เราตอบกลับภายใน 1–2 วัน": "— we reply within 1–2 days.",
  "ติดตั้งลงหน้าโฮม": "Install to home screen"
});

Object.assign(window.VELA_WEB_EN, {
  "__title__help-install.html": "Vela guide · install to your home screen (iPhone & Android)",
  "__title__help-checkin.html": "Vela guide · check in and capture moments",
  "คู่มือ Vela · ติดตั้งลงหน้าโฮม (iPhone & Android)": "Vela guide · install to your home screen (iPhone & Android)",
  "← ศูนย์ช่วยเหลือ": "← Help centre",
  "· เริ่มต้นใช้งาน": "· Getting started",
  "iPhone โหลด Vela จาก App Store ได้เลย · ส่วน Android (และใครที่อยากใช้บนเบราว์เซอร์) ติดตั้งลงหน้าจอโฮมสักครั้ง จะได้ไอคอนเหมือนแอปจริง เปิดเต็มจอ ไม่มีแถบเบราว์เซอร์มากวน และเปิดใช้ตอนไม่มีเน็ตได้ ใช้เวลาไม่ถึงหนึ่งนาที": "On iPhone you can get Vela from the App Store · on Android (or anywhere you prefer the browser), install it to your home screen once and you get a real app icon: full screen, no browser bar, and it opens with no connection. Takes under a minute.",
  "ได้ไอคอนบนหน้าโฮม": "An icon on your home screen",
  "เปิดเต็มจอ": "Opens full screen",
  "ใช้ตอนไม่มีเน็ตได้": "Works offline",
  "บน iPhone หรือ iPad": "On iPhone or iPad",
  "ต้องเปิดด้วย": "You must open it in",
  "เท่านั้น — ถ้าเปิดใน Chrome, Line หรือ Facebook จะไม่มีเมนูนี้ ให้กดปุ่มเปิดในเบราว์เซอร์ก่อน": "only — the menu doesn't appear inside Chrome, Line, or Facebook, so open it in the browser first.",
  "เปิด onevela.net ใน Safari": "Open onevela.net in Safari",
  "พิมพ์": "Type",
  "ในช่องที่อยู่ หรือกดลิงก์จากเพจก็ได้ รอให้หน้าเว็บขึ้นครบก่อน": "in the address bar, or tap a link from our page, and let the page finish loading.",
  "ทริปที่จบแล้ว ได้กลับมาเป็นหนังสือ": "A finished trip comes back as a book",
  "รูปกับโน้ตที่คุณจดไว้ระหว่างทาง Vela จัดหน้าให้เป็นเล่มจริง": "Vela lays out the photos and notes you kept on the road into a real book",
  "เริ่มเก็บทริปแรก ฟรี": "Start your first trip, free",
  "กดปุ่มแชร์ ที่แถบล่าง": "Tap Share in the bottom bar",
  "ปุ่มรูป": "The",
  "สี่เหลี่ยมมีลูกศรชี้ขึ้น": "square-with-an-arrow",
  "อยู่กลางแถบล่างของ Safari (บน iPad จะอยู่มุมขวาบน)": "icon in the middle of Safari's bottom bar (top right on iPad).",
  "เลื่อนลงหา “เพิ่มลงในหน้าจอโฮม”": "Scroll to \"Add to Home Screen\"",
  "แผงที่เด้งขึ้นมาให้เลื่อนลงมาเรื่อยๆ จะเจอบรรทัดนี้อยู่ในกลุ่มคำสั่งล่าง แล้วกดหนึ่งครั้ง": "Keep scrolling the panel that pops up — the line sits in the lower group of actions. Tap it once.",
  "คัดลอก": "Copy",
  "เพิ่มไปยังรายการโปรด": "Add to Favourites",
  "เพิ่มลงในหน้าจอโฮม": "Add to Home Screen",
  "มาร์กอัป": "Markup",
  "กด “เพิ่ม” มุมขวาบน": "Tap \"Add\" at the top right",
  "จะขึ้นชื่อ": "It suggests the name",
  "ให้แก้ชื่อได้ถ้าอยาก แล้วกดเพิ่ม — ไอคอนจะไปโผล่ที่หน้าจอโฮมทันที กดจากไอคอนนั้นได้เลยครั้งต่อไป": "— rename it if you like, then tap Add. The icon lands on your home screen straight away; use it from now on.",
  "บน Android": "On Android",
  "เปิด onevela.net ใน Chrome": "Open onevela.net in Chrome",
  "บาง Android จะเด้งแถบ": "Some Android phones show an",
  "“ติดตั้งแอป”": "\"Install app\"",
  "ขึ้นมาให้เองที่ด้านล่าง ถ้าเห็นแถบนั้นกดได้เลย จบในขั้นเดียว": "bar at the bottom by itself — if you see it, tap it and you're done in one step.",
  "ติดตั้งแอป Vela": "Install the Vela app",
  "ติดตั้ง": "Install",
  "ไม่เห็นแถบนั้น? กดจุดสามจุด": "No bar? Tap the three dots",
  "จุดสามจุดเรียงตั้ง": "The vertical three-dot menu",
  "อยู่มุมขวาบนของ Chrome ข้างช่องที่อยู่เว็บ": "at Chrome's top right, next to the address bar.",
  "เลือก “ติดตั้งแอป”": "Choose \"Install app\"",
  "บางเครื่องเขียนว่า": "Some phones call it",
  "เพิ่มลงในหน้าจอหลัก": "Add to Home screen",
  "— คำไหนก็ได้ ผลเหมือนกัน": "— either wording does the same thing.",
  "แท็บใหม่": "New tab",
  "ประวัติ": "History",
  "การตั้งค่า": "Settings",
  "ยืนยัน แล้วดูที่หน้าโฮม": "Confirm, then check your home screen",
  "กดติดตั้งอีกครั้งเพื่อยืนยัน ไอคอน Vela จะไปอยู่หน้าจอหลัก และอยู่ในลิ้นชักแอปเหมือนแอปทั่วไป": "Tap Install once more to confirm. The Vela icon appears on your home screen and in the app drawer like any other app.",
  "ติดแล้วเจอปัญหา?": "Ran into trouble?",
  "กดปุ่มแชร์แล้วไม่มี “เพิ่มลงในหน้าจอโฮม”": "Share has no \"Add to Home Screen\"",
  "เกือบทุกครั้งเป็นเพราะเปิดจากในแอปอื่น (Line, Facebook, Messenger) ไม่ใช่ Safari จริง — ให้กดจุดสามจุดในแอปนั้นแล้วเลือก “เปิดใน Safari” ก่อน หรือเลื่อนแผงแชร์ลงจนสุดแล้วกด “แก้ไขการทำงาน” เพื่อเปิดคำสั่งนี้": "Almost always because the page opened inside another app (Line, Facebook, Messenger) rather than Safari itself — tap that app's three dots and choose \"Open in Safari\" first, or scroll the share panel to the bottom and tap \"Edit Actions\" to enable the item.",
  "ติดตั้งแล้วต้องล็อกอินใหม่ไหม": "Do I have to sign in again after installing?",
  "อาจต้องล็อกอินอีกครั้งในไอคอนใหม่ เพราะระบบมองเป็นหน้าต่างแยกจากเบราว์เซอร์ ล็อกอินบัญชีเดิม ข้อมูลทริปจะกลับมาครบ": "You may, because the system treats the icon as a separate window from the browser. Sign into the same account and all your trips come back.",
  "ลบไอคอนออก ข้อมูลหายไหม": "If I delete the icon, do I lose data?",
  "ถ้าล็อกอินไว้แล้ว ข้อมูลอยู่ในบัญชีของคุณบนคลาวด์ ติดตั้งใหม่แล้วล็อกอินก็ได้คืน แต่ถ้าใช้แบบไม่ล็อกอิน ข้อมูลเก็บในเครื่องเท่านั้น — แนะนำล็อกอินไว้ก่อนลบ": "If you were signed in, your data is in your cloud account — reinstall, sign in, and it's back. If you were using it without an account, the data lives only on the device, so sign in before deleting.",
  "อัปเดตเวอร์ชันใหม่ยังไง": "How do updates work?",
  "ไม่ต้องทำอะไร Vela เช็คเวอร์ชันให้เอง ถ้ามีของใหม่จะเด้งแถบให้กดรีเฟรช เปิดแอปทิ้งไว้นานๆ แล้วปิดเปิดใหม่ก็ได้เวอร์ชันล่าสุด": "Nothing to do — Vela checks for itself and shows a refresh bar when there's a new build. Closing and reopening also gets you the latest version.",
  "คำถามอื่นเกี่ยวกับการใช้งาน ดูที่": "For other questions, see the",
  "หรือเขียนมาที่": "or write to",
  "ติดตั้งแล้ว เริ่มทริปแรกได้เลย": "Installed? Start your first trip",
  "ตั้งชื่อทริป ใส่ช่วงวัน แล้ววางแผนรายวันได้ทันที": "Name the trip, set the dates, and plan it day by day right away",
  "เปิด Vela": "Open Vela",
  "คู่มือ Vela · เช็คอินและเก็บโมเมนต์ระหว่างเที่ยว": "Vela guide · check in and capture moments",
  "· ระหว่างเที่ยว": "· On the road",
  "เช็คอินและเก็บโมเมนต์": "Check in and capture moments",
  "นี่คือขั้นที่สำคัญที่สุดของทั้งแอป — ทุกอย่างที่จดไว้ตอนอยู่ที่นั่นจะกลายเป็นเส้นทางบนแผนที่ เป็นเรื่องเล่า และเป็นหน้าในหนังสือของทริปนี้ ใช้เวลาจดครั้งละไม่ถึงยี่สิบวินาที": "This is the most important step in the whole app — everything you note while you're there becomes a route on the map, a story, and a page in this trip's book. Each entry takes under twenty seconds.",
  "ใช้ได้ในแพ็กฟรี": "Included in Free",
  "ทำงานตอนไม่มีเน็ต": "Works offline",
  "จดย้อนหลังได้": "Can be logged later",
  "กดปุ่ม “บันทึก” มุมขวาล่าง": "Tap \"Save\" at the bottom right",
  "ปุ่มสีเข้มลอยอยู่มุมขวาล่างตอนเปิดทริป — กดได้จากทั้งหน้าทริปและหน้าแผนที่ หรือกดการ์ด": "The dark floating button at the bottom right of an open trip — available on both the trip screen and the map, or tap the",
  "บันทึกเรื่องวันนี้": "Write today's entry",
  "ในวันนั้นก็ได้ ผลเหมือนกัน": "card on that day; same result.",
  "คาซัคสถาน หน้าร้อน": "Kazakhstan in summer",
  "วันที่ 3": "Day 3",
  "เดินเมืองเก่า": "Walking the old town",
  "เก็บรูป โน้ต ระหว่างเที่ยว": "Collect photos and notes as you go",
  "+ บันทึก": "+ Save",
  "✦ ถาม AI": "✦ Ask AI",
  "รอ GPS แล้วใส่ว่าอยู่ที่ไหน": "Wait for GPS, then say where you are",
  "พอเปิดฟอร์ม แอปจะหาตำแหน่งให้เอง ถ้าขึ้นแถบเขียว": "When the form opens, the app finds your location itself. A green",
  "ได้ตำแหน่งแล้ว": "Got your location",
  "หมายความว่าจะปักหมุดบนแผนที่ทริปด้วย ถ้าหาไม่ได้ก็บันทึกได้ปกติ แค่ไม่มีหมุด — ช่องที่ต้องกรอกจริงๆ มีช่องเดียวคือ “อยู่ที่ไหน”": "bar means it will also drop a pin on the trip map. If it can't find you, saving still works — just without a pin. The only field you really have to fill in is \"Where are you\".",
  "บันทึกโมเมนต์": "Save moment",
  "✓ ได้ตำแหน่งแล้ว · จะปักหมุดให้": "✓ Got your location · a pin will be dropped",
  "26 ก.ค. 14:20": "Jul 26, 14:20",
  "จ่ายไปเท่าไหร่ (ไม่บังคับ)": "How much did it cost (optional)",
  "แนบรูป แล้วกดบันทึก": "Attach photos, then save",
  "กดกรอบ": "Tap the",
  "+ รูป": "+ Photo",
  "เลือกได้หลายใบพร้อมกัน รูปพวกนี้คือวัตถุดิบของโฟโต้บุ๊กทีหลัง ใส่เยอะได้ไม่ต้องกลัว": "box — you can pick several at once. These photos are the raw material for the photo book later, so add plenty.",
  "เห็นปุ่มปฏิทินเล็กๆ ที่มุมรูปไหม — กดแล้วแอปจะดึงวัน-เวลาจากในรูปมาใส่ให้ นี่คือวิธีจดย้อนหลังตอนกลับถึงที่พักแล้ว": "See the small calendar button on the corner of a photo? Tap it and the app reads the date and time from the file — this is how you log things later, back at the hotel.",
  "รูปของโมเมนต์นี้": "Photos in this moment",
  "ปุ่มปฏิทินบนรูป = ใช้วัน-เวลาจากรูปนั้น": "The calendar button on a photo = use that photo's date and time",
  "ยกเลิก": "Cancel",
  "บันทึก": "Save",
  "✓ เช็คอิน “ร้านกาแฟริมน้ำ” แล้ว · ปักหมุด + ขึ้นหน้าโมเมนต์": "✓ Checked in at \"The café by the river\" · pinned and added to moments",
  "จดแล้วไปโผล่ที่ไหน": "Where it all shows up",
  "จดครั้งเดียว ใช้ต่อได้สี่ที่": "Write once, used in four places",
  "เรียงตามวันในทริป ย้อนอ่านได้ทั้งทริป": "Ordered by day, so you can reread the whole trip",
  "แผนที่": "Map",
  "หมุดทุกจุดที่เช็คอิน ลากเป็นเส้นทางให้เห็น": "Every check-in pinned, joined into a route",
  "งบ": "Budget",
  "ยอดที่ใส่ในช่อง “จ่ายไปเท่าไหร่” ลงหน้างบเอง": "Whatever you put in \"How much did it cost\" lands in the budget by itself",
  "เล่ม": "Book",
  "รูปกับโน้ตกลายเป็นเนื้อหาของเรื่องเล่า หนังสือ และโฟโต้บุ๊ก": "Photos and notes become the content of stories, books, and photo books",
  "คลิป": "Clip",
  "รูปเด่นถูกหยิบไปต่อเป็นคลิปสรุปทริป 45–60 วิ ลงโซเชียลได้": "The best photos are cut into a 45–60 second recap clip for social",
  "เพราะอย่างนี้ ทริปที่เช็คอินไว้เยอะจะได้เล่มที่หนาและสนุกกว่า — ไม่ต้องเขียนสวย ขอแค่จดไว้ให้ทัน · ทั้งเล่มและคลิปทำได้ฟรี ไม่จำกัดจำนวนครั้ง": "Which is why trips with more check-ins make thicker, better books — it doesn't have to be well written, just written down · books and clips are free and unlimited.",
  "คำถามที่มักเจอ": "Common questions",
  "ลืมจดตอนอยู่ที่นั่น จดย้อนหลังได้ไหม": "I forgot to log it there — can I do it later?",
  "ได้ และมีทางลัด — แนบรูปที่ถ่ายไว้ตอนนั้น แล้วกดปุ่มปฏิทินเล็กที่มุมรูป แอปจะดึงวัน-เวลา (และพิกัด ถ้ารูปมี) จากในรูปมาใส่ให้ โมเมนต์จะไปอยู่ในวันที่ถูกต้องเอง": "Yes, and there's a shortcut — attach a photo you took at the time and tap the small calendar button on its corner. The app pulls the date and time (and coordinates, if the file has them) from the photo, and the moment lands on the right day.",
  "ไม่มีเน็ตตอนเที่ยว เช็คอินได้ไหม": "Can I check in with no connection?",
  "ได้ ทุกอย่างเก็บลงเครื่องก่อน แล้วซิงก์ขึ้นบัญชีให้เองเมื่อกลับมามีเน็ต — ตำแหน่ง GPS ก็ยังทำงานตอนไม่มีเน็ต แต่ชื่อสถานที่อาจยังไม่ขึ้นจนกว่าจะออนไลน์": "Yes — everything is stored on the device first, then synced to your account when you're back online. GPS still works offline, though the place name may not appear until you reconnect.",
  "ขึ้นว่า “หาตำแหน่งไม่ได้” ทำยังไง": "It says \"couldn't get a location\" — what now?",
  "ลองอีกครั้ง": "Try again",
  "ในแถบสีส้ม ถ้ายังไม่ได้ให้เช็กว่าอนุญาตตำแหน่งให้เบราว์เซอร์ไว้ไหม (ในการตั้งค่าเครื่อง) และอยู่ในอาคารหนาๆ สัญญาณอาจอ่อน — ไม่มีหมุดก็บันทึกได้ ไปเติมพิกัดทีหลังไม่ได้ แต่โน้ตกับรูปยังอยู่ครบ": "in the orange bar. If it still fails, check that the browser has location permission (in device settings); deep inside a building the signal can be weak. You can save without a pin — coordinates can't be added later, but the notes and photos are all kept.",
  "คนอื่นเห็นโมเมนต์ของเราไหม": "Can other people see my moments?",
  "ทริปเป็นส่วนตัวโดยค่าเริ่มต้น สิ่งที่จดไว้อยู่ในบัญชีคุณคนเดียว ถ้าอยากให้เรื่องไหนคนอื่นอ่านได้ ค่อยเลือกแชร์เป็นเรื่องเล่าทีหลัง": "Trips are private by default and what you write stays in your account alone. If you want something read, you can choose to share it as a story later.",
  "แก้หรือลบโมเมนต์ที่จดไปแล้วได้ไหม": "Can I edit or delete a moment?",
  "ได้ แตะโมเมนต์นั้นในแท็บโมเมนต์ของทริป จะมีปุ่มแก้ไขกับลบ แก้เวลาย้อนไปวันอื่นก็ได้ โมเมนต์จะย้ายไปวันนั้นให้เอง": "Yes — tap it in the trip's Moments tab and you'll find edit and delete. You can change the time to another day, and the moment moves there itself.",
  "คำถามอื่นดูที่": "For other questions, see the",
  "ทริปหน้าอย่าลืมจด": "Don't forget to write it down next trip",
  "วันละสามสี่โมเมนต์ก็พอให้ได้เล่มที่อ่านสนุก": "Three or four moments a day is enough for a book worth reading",
  "ที่พักและงบ": "Stays & budget"
});

Object.assign(window.VELA_WEB_EN, {
  "__title__help-plan.html": "Vela guide · create your first trip and plan it day by day",
  "__title__help-budget.html": "Vela guide · add stays and keep the budget",
  "คู่มือ Vela · สร้างทริปแรก แล้ววางแผนรายวัน": "Vela guide · create your first trip and plan it day by day",
  "· วางแผนทริป": "· Planning",
  "ใน Vela ทุกอย่างเริ่มจาก “ทริป” หนึ่งอัน — ใส่ชื่อกับช่วงวันเดินทาง แอปจะสร้างวันให้ครบทุกวันเอง แล้วคุณค่อยเติมกิจกรรมเข้าไปทีละวันตามสบาย ไม่ต้องวางให้เสร็จรอบเดียว": "In Vela everything starts with one trip — give it a name and the travel dates, and the app creates every day for you. Then fill in activities day by day at your own pace; nothing has to be finished in one sitting.",
  "7 ขั้น": "7 steps",
  "ใช้ได้ทั้งฟรีและพรีเมียม": "Free and Premium",
  "แก้ทีหลังได้ตลอด": "Editable anytime",
  "ตอนที่ 1 · สร้างทริป": "Part 1 · create the trip",
  "ไปแท็บ “แผนของฉัน”": "Go to the \"My plans\" tab",
  "แท็บที่สามจากแถบล่าง แล้วกดปุ่ม": "The third tab in the bottom bar, then tap",
  "+ สร้างทริปใหม่": "+ Create a trip",
  "ในการ์ดสีดินเผาด้านบน": "in the terracotta card at the top.",
  "ทริปหน้าไปไหน?": "Where to next?",
  "ตั้งชื่อ ใส่ช่วงวันกับงบ แล้วเริ่มวางแผนรายวัน": "Name it, set the dates and budget, then plan day by day",
  "กรอกชื่อทริปกับช่วงวัน": "Enter the name and dates",
  "ช่องที่ต้องมีจริงๆ คือ": "The only required field is the",
  "ชื่อทริป": "trip name",
  "อย่างเดียว ที่เหลือเว้นไว้ก่อนได้ แต่ถ้าใส่": "— leave the rest for later if you like. But if you set the",
  "วันเริ่ม–วันจบ": "start and end dates",
  "แอปจะสร้างวันให้ครบทันที (24 ก.ค.–3 ส.ค. = 11 วัน) และถ้าใส่": "the app creates every day at once (Jul 24–Aug 3 = 11 days), and if you enter a",
  "ไว้ หน้างบจะคำนวณยอดคงเหลือให้เอง": "the budget screen works out what's left for you.",
  "แตะแถบรูปด้านบนเพื่อเลือกรูปปกจากอัลบั้มในเครื่อง — รูปนี้จะไปเป็นปกหนังสือของทริปนี้ทีหลังด้วย": "Tap the image strip at the top to choose a cover from your gallery — it becomes the cover of this trip's book later too.",
  "แตะเพื่อเลือกรูปปก": "Tap to choose a cover",
  "วันเริ่ม": "Start date",
  "24 ก.ค.": "Jul 24",
  "วันจบ": "End date",
  "3 ส.ค.": "Aug 3",
  "งบประมาณ (บาท)": "Budget (THB)",
  "ทริปนี้ 11 วัน": "This trip is 11 days",
  "สร้างทริป": "Create trip",
  "ทางลัด: ถ้าซื้อทัวร์มาแล้ว": "Shortcut: already booked a tour?",
  "ในหน้าสร้างทริปเลื่อนลงจะเจอ": "Scroll down on the create screen and you'll find",
  "โหลด/แยกโปรแกรมทัวร์ของคุณ": "Import & split your itinerary",
  "— ก็อปข้อความโปรแกรมจากอีเมลหรือไลน์มาวาง หรือแนบไฟล์ PDF กับรูปก็ได้ AI จะแยกให้เป็นแผนรายวันพร้อมชื่อวันให้เลย แล้วค่อยแก้ต่อ (ฟีเจอร์พรีเมียม — ใช้ AI ของ Vela ได้เลย ไม่ต้องหา API key เอง)": "— paste the itinerary text from an email or chat, or attach a PDF or photo. AI splits it into daily plans with day titles, ready for you to edit (a Premium feature — Vela's AI is built in, no API key needed).",
  "ตอนที่ 2 · วางแผนรายวัน": "Part 2 · plan each day",
  "เลือกวันจากแถบตัวเลข": "Pick a day from the number strip",
  "เปิดทริปขึ้นมา จะเห็นแถบวันเรียงกันใต้รูปปก แตะเลข": "Open the trip and you'll see the days lined up under the cover — tap a number",
  "เพื่อสลับไปวันที่อยากวาง เลื่อนซ้าย-ขวาได้ถ้าทริปยาว": "to switch to the day you want, and swipe if the trip is long.",
  "24 ก.ค. – 3 ส.ค. · 11 วัน": "Jul 24 – Aug 3 · 11 days",
  "จ.": "M",
  "อ.": "T",
  "พ.": "W",
  "พฤ.": "T",
  "ศ.": "F",
  "แก้ไข": "Edit",
  "ตลาดเช้า → พิพิธภัณฑ์ → ร้านกาแฟ": "Morning market → museum → café",
  "กด “แก้ไข” แล้วตั้งชื่อวัน": "Tap \"Edit\" and name the day",
  "ปุ่มแก้ไขอยู่ขวามือบรรทัด “วันที่ 3” — กดแล้วช่องกรอกจะเปิดออก ตั้งชื่อวันสั้นๆ เช่น": "The edit button sits to the right of the \"Day 3\" line — tap it and the fields open. Give the day a short title, such as",
  "กับคำอธิบายหนึ่งบรรทัด ชื่อวันนี้จะกลายเป็นหัวข้อตอนในหนังสือทีหลัง": "plus a one-line description. That title becomes the chapter heading in the book later.",
  "เสร็จแล้ว": "Done",
  "ชื่อวัน": "Day title",
  "รายละเอียดสั้นๆ ของวันนี้": "A short note about this day",
  "ตลาดเช้า → พิพิธภัณฑ์ → ร้านกาแฟริมน้ำ": "Morning market → museum → café by the river",
  "เก็บรูป โน้ต ตอนเที่ยว": "Collect photos and notes as you travel",
  "กด “+ เพิ่มกิจกรรม”": "Tap \"+ Add activity\"",
  "อยู่ท้ายไทม์ไลน์ของวันนั้น เลือกหมวดก่อน (ที่เที่ยว · กิน · เดินทาง · ที่พัก) แล้วใส่เวลา ชื่อกิจกรรม และรายละเอียดถ้ามี — ใส่แค่เวลากับชื่อก็พอ กิจกรรมจะเรียงตามเวลาให้เอง": "It sits at the end of that day's timeline. Pick a category (places · food · transport · stay), then add a time, a name, and details if you have them — a time and a name is enough, and activities sort themselves by time.",
  "เพิ่มกิจกรรมลงวันที่ 3": "Add an activity to day 3",
  "เลือกหมวด": "Pick a category",
  "ที่เที่ยว": "Places",
  "กิน": "Food",
  "เดินทาง": "Transport",
  "ตลาดเช้าริมคลอง": "Morning market by the canal",
  "ชิมของกินท้องถิ่น เผื่อเวลา 1 ชม.": "Try the local food, allow an hour",
  "ใส่ที่พักครั้งเดียว จบทุกคืน": "One stay entry covers every night",
  "การ์ดสีเข้ม": "The dark",
  "ที่พักคืนนี้": "Tonight's stay",
  "อยู่ล่างสุดของวัน กดแก้ไขแล้วใส่ชื่อที่พักกับวันเข้า–ออก — Vela จะเติมที่พักเดียวกันให้ทุกคืนในช่วงนั้นเอง ไม่ต้องกรอกซ้ำทีละวัน": "card at the bottom of the day — tap edit, add the stay's name and its check-in and check-out dates, and Vela fills the same stay into every night in that range. No repeating it day by day.",
  "คืนที่ 3 จาก 5 · 24–29 ก.ค.": "Night 3 of 5 · Jul 24–29",
  "เข้า": "In",
  "ออก": "Out",
  "29 ก.ค.": "Jul 29",
  "เติมให้อัตโนมัติแล้ว": "Filled in automatically",
  "วันที่ 1 · 24 ก.ค.": "Day 1 · Jul 24",
  "วันที่ 2 · 25 ก.ค.": "Day 2 · Jul 25",
  "…และคืนที่เหลือถึง 29 ก.ค.": "…and the remaining nights through Jul 29",
  "รู้จักแถบเมนูบนหน้าทริป": "The trip screen's menu bar",
  "ใต้รูปปกทริปมีแถบปุ่มเลื่อนได้ แต่ละอันคือมุมมองคนละแบบของทริปเดียวกัน": "Under the cover there's a scrolling row of buttons — each is a different view of the same trip.",
  "ภาพรวม": "Overview",
  "ดูทุกวันเรียงต่อกันในหน้าเดียว": "Every day in one continuous page",
  "เตรียมตัว": "Prep",
  "เช็กลิสต์ของที่ต้องเตรียมก่อนไป": "The packing checklist for before you go",
  "รูปกับโน้ตที่บันทึกไว้ และแผนที่จุดที่เช็คอิน": "The photos and notes you saved, and a map of your check-ins",
  "ยอดที่ตั้งไว้ ใช้ไปแล้วเท่าไหร่ เหลือเท่าไหร่": "What you budgeted, what you've spent, what's left",
  "AI จัดวัน": "AI day plan",
  "ให้ AI ช่วยร่างแผนของวันนั้นให้ (พรีเมียม)": "Let AI draft that day for you (Premium)",
  "สรุปทริป": "Trip summary",
  "หลังกลับใช้ตรงนี้ทำเรื่องเล่าและรวมเป็นเล่ม": "After you're back, this is where stories and books get made",
  "คำถามที่มักเจอตอนวางแผน": "Common planning questions",
  "ยังไม่รู้วันเดินทาง สร้างทริปได้ไหม": "I don't know the dates yet — can I still create it?",
  "ได้ ใส่แค่ชื่อทริปแล้วกดสร้างเลย จะได้ทริปที่มีวันเดียวไว้ก่อน พอรู้วันจริงมากดแก้ไขทริปแล้วเติมวันเริ่ม–วันจบ ระบบจะขยายวันให้ครบเอง": "Yes — enter just the name and create it. You get a one-day trip for now; when you know the real dates, edit the trip and add them, and the days expand to fit.",
  "เลื่อนวันเดินทาง แผนที่วางไว้หายไหม": "If the dates move, do I lose the plan?",
  "ไม่หาย กิจกรรมยังผูกกับ “วันที่เท่าไหร่ของทริป” ไม่ใช่วันที่ปฏิทิน เปลี่ยนวันเริ่มแล้ววันที่จะขยับตามให้ทั้งทริป": "No — activities are tied to \"which day of the trip\", not a calendar date. Change the start date and the whole trip shifts with it.",
  "อยากเพิ่มวันทีหลังทำได้ไหม": "Can I add a day later?",
  "ได้ กดปุ่มแก้ไขในวันไหนก็ได้ แล้วจะเห็นปุ่ม": "Yes — tap edit on any day and you'll find a button",
  "ต่อท้ายแถบวัน กดเพื่อเพิ่มวันเข้าไปอีกหนึ่งวัน": "at the end of the day strip that adds one more day.",
  "ต้องวางแผนให้ครบทุกวันก่อนไปไหม": "Do I have to plan every day before I go?",
  "ไม่ต้องเลย หลายคนใส่แค่วันแรกกับวันที่มีจองไว้ ที่เหลือค่อยเติมตอนอยู่ที่นั่น — วันที่ยังว่างก็ยังใช้บันทึกโมเมนต์ได้ปกติ": "Not at all — many people fill in day one and the days with bookings, then add the rest while they're there. Empty days still work for logging moments.",
  "ลองสร้างทริปแรกเลย": "Create your first trip",
  "ใส่ชื่อกับช่วงวัน ไม่ถึงนาทีก็เริ่มวางแผนวันแรกได้": "Add a name and dates, and you're planning day one in under a minute",
  "คู่มือ Vela · ใส่ที่พักและคุมงบทริป": "Vela guide · add stays and keep the budget",
  "สองเรื่องที่ทำครั้งเดียวแล้วสบายไปทั้งทริป — ที่พักกรอกวันเข้า–ออกทีเดียวให้เติมครบทุกคืน และงบที่ตั้งไว้จะคอยบอกว่าเหลือเท่าไหร่ทุกครั้งที่จดรายจ่าย": "Two things you set up once and forget — enter a stay's dates once and every night is filled in, and the budget you set tells you what's left every time you log spending.",
  "รองรับเงินต่างประเทศ": "Handles foreign currency",
  "ตอนที่ 1 · ที่พัก": "Part 1 · stays",
  "เปิดวันไหนก็ได้ เลื่อนหาการ์ดสีเข้ม": "Open any day and scroll to the dark card",
  "การ์ด": "The",
  "อยู่ล่างสุดของไทม์ไลน์วันนั้น ถ้ายังไม่ได้ใส่จะขึ้นว่า “ยังไม่ได้เลือกที่พัก” — กดที่การ์ดเพื่อแก้ไข": "card sits at the bottom of that day's timeline. If nothing is set it reads \"No stay chosen yet\" — tap it to edit.",
  "+ เพิ่มกิจกรรม": "+ Add activity",
  "ยังไม่ได้เลือกที่พัก": "No stay chosen yet",
  "เพิ่มได้ในโหมดแก้ไข": "Add it in edit mode",
  "ใส่ชื่อที่พัก + วันเช็คอิน/เช็คเอาต์": "Add the stay's name + check-in/check-out",
  "ช่อง": "The",
  "เมือง / โน้ต": "City / note",
  "ใส่หรือเว้นก็ได้ ที่สำคัญคือวันเช็คอินกับเช็คเอาต์ — กดบันทึกครั้งเดียว แล้วทุกคืนในช่วงนั้นจะขึ้นที่พักนี้ให้เอง เปลี่ยนโรงแรมกลางทริปก็แค่ใส่ช่วงที่สองเข้าไป": "field is optional; what matters are the check-in and check-out dates. Save once and every night in that range shows this stay. Changing hotel mid-trip? Just add a second range.",
  "ชื่อที่พัก": "Stay name",
  "อัลมาตี · ใกล้ตลาดกลาง": "Almaty · near the central market",
  "เช็คเอาต์": "Check out",
  "บันทึกที่พัก": "Save stay",
  "เติมให้แล้ว 5 คืน (วันที่ 1–5)": "Filled in 5 nights (days 1–5)",
  "ตอนที่ 2 · งบทริป": "Part 2 · the trip budget",
  "เปิดแท็บ “งบ” บนหน้าทริป": "Open the \"Budget\" tab on the trip screen",
  "การ์ดดำด้านบนเทียบสองยอดให้เห็นทันที —": "The black card at the top compares two numbers —",
  "วางแผนไว้": "Planned",
  "คือยอดที่คุณกรอกตอนสร้างทริป (แก้ได้ที่แก้ไขทริป) และ": "is what you entered when creating the trip (editable in trip settings), and",
  "จ่ายจริง": "Actual",
  "คือผลรวมรายจ่ายที่จดไว้ ใต้ลงมาบอกว่าเหลือหรือเกินเท่าไหร่": "is the sum of what you've logged. Below that it tells you how much is left or over.",
  "เหลืออีก ฿28,750": "฿28,750 left",
  "1 บาท = 15.5 เทงเก": "1 THB = 15.5 tenge",
  "แก้": "Edit",
  "+ จดรายจ่าย": "+ Log spending",
  "มื้อเย็นเมืองเก่า": "Dinner in the old town",
  "กิน · วันที่ 3": "Food · day 3",
  "กระเช้าขึ้นเขา": "Cable car up the mountain",
  "ที่เที่ยว · วันที่ 3": "Places · day 3",
  "ตั้งอัตราแลกเปลี่ยนก่อนออกเดินทาง": "Set the exchange rate before you leave",
  "แถบอัตราแลกเปลี่ยนอยู่ใต้การ์ดดำ กด": "The exchange-rate bar sits under the black card — tap",
  "แล้วใส่ชื่อสกุลเงินกับเรท — ใส่ได้ทั้งแบบ “1 บาท = ? เทงเก” หรือ “1 เทงเก = ? บาท” อันไหนจำง่ายกว่าก็อันนั้น จากนั้นเวลาจดรายจ่ายจะมีช่องเงินต่างประเทศเพิ่มมา กรอกตัวเลขบนใบเสร็จตรงๆ แล้วแอปแปลงเป็นบาทให้": "and enter the currency and the rate — either \"1 THB = ? tenge\" or \"1 tenge = ? THB\", whichever you find easier. After that, logging spending gains a foreign-currency field: type the number on the receipt and the app converts it for you.",
  "อัตราแลกเปลี่ยน": "Exchange rate",
  "สกุลเงิน": "Currency",
  "เทงเก": "Tenge",
  "1 บาท = ? เทงเก": "1 THB = ? tenge",
  "หรือ": "or",
  "1 เทงเก = ? บาท": "1 tenge = ? THB",
  "บันทึกอัตรา": "Save rate",
  "วิธีที่เร็วที่สุด: จดตอนจ่ายเลย": "The fastest way: log it as you pay",
  "ในฟอร์ม": "The",
  "มีช่อง “จ่ายไปเท่าไหร่” อยู่ด้วย — จดที่ร้านพร้อมรูปอาหารทีเดียว ยอดนั้นจะไปโผล่ในหน้างบให้เอง ไม่ต้องเปิดสองที่": "form has a \"How much did it cost\" field — log it at the table along with the photo of your food, and the amount appears in the budget by itself. No need to open two screens.",
  "เปลี่ยนโรงแรมกลางทริปทำยังไง": "How do I change hotel mid-trip?",
  "ไปที่วันแรกของโรงแรมใหม่ กดแก้ไขการ์ดที่พัก ใส่ชื่อกับช่วงวันของโรงแรมนั้น — ช่วงใหม่จะทับเฉพาะคืนที่ระบุ คืนก่อนหน้ายังเป็นโรงแรมเดิม": "Go to the first day at the new hotel, edit the stay card, and enter its name and dates — the new range only covers the nights you specify, and earlier nights keep the old hotel.",
  "ยังไม่ตั้งงบไว้ตอนสร้างทริป เพิ่มทีหลังได้ไหม": "I didn't set a budget — can I add one later?",
  "ได้ กดแก้ไขทริปแล้วเติมช่องงบประมาณ ยอด “วางแผนไว้” จะอัปเดตทันที รายจ่ายที่จดไปแล้วยังอยู่ครบ": "Yes — edit the trip and fill in the budget field. \"Planned\" updates immediately and everything you've already logged stays.",
  "จ่ายด้วยเงินสกุลอื่น ต้องกดเครื่องคิดเลขเองไหม": "Do I have to convert foreign currency myself?",
  "ไม่ต้อง ตั้งอัตราไว้ครั้งเดียวแล้วกรอกตัวเลขตามใบเสร็จ ระบบเก็บทั้งยอดสกุลนั้นและยอดบาทให้ ตอนสรุปทริปจะเห็นเป็นบาททั้งหมด": "No — set the rate once and type the number on the receipt. The app stores both the foreign amount and the home-currency amount, and the trip summary shows everything in one currency.",
  "งบนี้ไปอยู่ในหนังสือที่ทำหลังกลับด้วยไหม": "Does the budget appear in the book?",
  "อยู่ครับ ในเล่มจะมีหน้าสรุปค่าใช้จ่ายว่าทริปนี้ใช้ไปเท่าไหร่และหมวดไหนหนักสุด ถ้าไม่ได้จดรายจ่ายไว้ หน้านั้นจะข้ามไปเอง": "It does — the book includes a spending page showing what the trip cost and which categories were heaviest. If you logged nothing, that page is skipped.",
  "ต่อไปคือเก็บโมเมนต์ระหว่างทาง": "Next: capture moments on the road",
  "แผนพร้อม งบพร้อม เหลือแค่จดสิ่งที่เกิดขึ้นจริง": "The plan is set and the budget is set — all that's left is writing down what actually happens",
  "อ่านคู่มือเช็คอิน": "Read the check-in guide"
});

Object.assign(window.VELA_WEB_EN, {
  "__title__help-book.html": "Vela guide · make a photo book or an ebook from a trip (free)",
  "คู่มือ Vela · ทำโฟโต้บุ๊กและอีบุ๊กจากทริป (ฟรี)": "Vela guide · make a photo book or an ebook from a trip (free)",
  "· หลังกลับจากทริป": "· After the trip",
  "ทำทริปให้เป็นหนังสือ": "Turn a trip into a book",
  "เมื่อทริปจบ Vela จะเอารูปกับโน้ตที่คุณจดไว้มาจัดหน้าเป็นเล่มจริง — มีปก สารบัญ แผนที่เส้นทาง และหน้าสรุปค่าใช้จ่าย เปิดพลิกอ่านได้ในแอป หรือกดบันทึกเป็น PDF เก็บไว้/ส่งไปสั่งพิมพ์ — ทำได้ฟรีทั้งเล่ม ไม่จำกัดจำนวนครั้ง": "When the trip is over, Vela lays out the photos and notes you kept into a real book — cover, contents, route map, and a spending page. Read it page by page in the app, or save a PDF to keep or send to a printer — the whole book, free, as many times as you like.",
  "2 แบบให้เลือก": "Two formats",
  "บันทึกเป็น PDF ได้": "Save as PDF",
  "เลือกก่อน: เล่มไหนเหมาะกับทริปนี้": "First: which format suits this trip?",
  "ทำทั้งสองแบบจากทริปเดียวก็ได้ ข้อมูลชุดเดียวกัน": "You can make both from one trip — same underlying material.",
  "โฟโต้บุ๊ก — รูปเล่าเรื่อง": "Photo book — the photos tell it",
  "เล่มแนวนอน A5 รูปเป็นพระเอก แต่ละวันเปิดด้วยภาพเต็มหน้า แล้วต่อด้วยหน้ารวมรูป 2–4 ใบ มีแค่ชื่อวันกับชื่อสถานที่กำกับ": "A5 landscape, photos in the lead. Each day opens on a full-page image, then pages of 2–4 photos, captioned only with the day title and place names.",
  "เหมาะกับทริปที่ถ่ายรูปเยอะแต่ไม่ได้เขียนอะไรมาก": "Best for trips with lots of photos and little writing",
  "อีบุ๊ก — ตัวหนังสือเล่าเรื่อง": "Ebook — the writing tells it",
  "เล่มตั้ง A5 แบ่งเป็นตอนตามวัน มีเรื่องเล่า โน้ตของแต่ละเช็คอิน เวลาและชื่อสถานที่ พร้อมรูปแทรกระหว่างย่อหน้า": "A5 portrait, split into chapters by day, with the story, each check-in's notes, times and place names, and photos between the paragraphs.",
  "เหมาะกับทริปที่จดโน้ตไว้เยอะ หรือเขียนเรื่องเล่าไว้แล้ว": "Best for trips with plenty of notes, or a story already written",
  "ทำทีละขั้น": "Step by step",
  "เปิดทริป แล้วไปแท็บ “สรุปทริป”": "Open the trip and go to \"Trip summary\"",
  "อยู่ในแถบปุ่มใต้รูปปกทริป เลื่อนไปทางขวาสุด — ในนั้นจะเห็นปุ่มทำโฟโต้บุ๊กกับอีบุ๊ก พร้อมบอกว่าทริปนี้มีกี่รูป กี่เช็คอิน และเล่มจะได้ประมาณกี่หน้า": "It's in the button row under the cover, at the far right — inside you'll find the photo-book and ebook buttons, along with how many photos and check-ins the trip has and roughly how many pages you'll get.",
  "ทริปนี้เก็บไว้": "This trip holds",
  "38 เช็คอิน": "38 check-ins",
  "142 รูป": "142 photos",
  "ทำโฟโต้บุ๊ก": "Make a photo book",
  "ประมาณ 46 หน้า": "About 46 pages",
  "เริ่ม": "Start",
  "ทำอีบุ๊ก": "Make an ebook",
  "ประมาณ 88 หน้า": "About 88 pages",
  "เลือกปกเอง (แนะนำ)": "Choose the cover yourself (recommended)",
  "แตะกรอบปกแล้วกด": "Tap the cover frame and hit",
  "เปลี่ยนปก": "Change cover",
  "เลือกรูปที่อยากให้เป็นหน้าแรกของเล่ม ถ้าไม่เลือก แอปจะหยิบรูปแนวนอนใบแรกที่เจอมาให้ — ใช้ได้ แต่เลือกเองสวยกว่าแน่นอน": "then pick the photo you want as the first page. If you skip it, the app takes the first landscape photo it finds — fine, but your own pick always looks better.",
  "ชื่อเล่ม": "Book title",
  "คำโปรย": "Subtitle",
  "11 วัน 10 คืน · อัลมาตี": "11 days, 10 nights · Almaty",
  "ตั้งค่าเล่ม แล้วกดทำ": "Set the options, then build",
  "ก่อนกดทำ เลือกได้ว่าโมเมนต์ไหนจะเข้าเล่ม (ช่องติ๊ก) ·": "Before building you can choose which moments go in (the tick boxes) ·",
  "ธีมสี": "colour theme",
  "ครีม/ขาว/เข้ม ·": "cream / white / dark ·",
  "คุณภาพไฟล์": "file quality",
  "อ่านบนจอ (ไฟล์เล็ก ส่งต่อง่าย) หรือสำหรับพิมพ์ · แล้วปรับกรอบรูป เลย์เอาต์ และลำดับหน้าแต่ละวันได้ทีละใบ จากนั้นแอปจะจัดหน้าให้ — ทริปที่รูปเยอะใช้เวลาสักครู่ อย่าปิดหน้าจอระหว่างนี้": "read on screen (small file, easy to send) or print quality · then adjust framing, layouts, and each day's page order photo by photo. The app lays it out — trips with many photos take a moment, so keep the screen open.",
  "กำลังจัดหน้า…": "Laying out pages…",
  "รวบรวมรูปแล้ว 104 ใบ": "104 photos gathered",
  "พลิกอ่าน หรือบันทึกเป็น PDF (2 โหมด)": "Read it, or save a PDF (two modes)",
  "แตะขวา-ซ้ายเพื่อพลิกหน้า กด": "Tap left and right to turn pages, hit",
  "เรียงหน้า": "Page order",
  "เพื่อดูทุกหน้าต่อกัน หรือ": "to see every page at once, or",
  "บันทึกเป็น PDF": "Save as PDF",
  "เพื่อเก็บไฟล์ไว้/ส่งให้ร้านพิมพ์ (โฟโต้บุ๊ก = A5 แนวนอน · อีบุ๊ก = A5 แนวตั้ง) เล่มที่ทำแล้วจะไปอยู่ในชั้นหนังสือที่แท็บ “ฉัน”": "to keep the file or send it to a printer (photo book = A5 landscape · ebook = A5 portrait). Finished books land on the shelf in the \"Me\" tab.",
  "วันที่ 03": "Day 03",
  "บันทึก PDF": "Save PDF",
  "เคล็ดลับ": "Tips",
  "ใส่รูปแบบไหน เล่มออกมาสวย": "Which photos make a better book",
  "Vela จัดหน้าให้เองโดยไม่ครอบรูปให้เสียสัดส่วน และถ้าไม่ถูกใจก็ปรับกรอบเองได้ทุกใบ — แต่ยังมีบางอย่างที่ช่วยให้เล่มดูดีขึ้นตั้งแต่ตอนถ่าย": "Vela lays out pages without distorting your photos, and you can re-frame any of them — but a few habits while shooting make the book better from the start.",
  "ใบแรกของโมเมนต์คือใบที่ถูกใช้ใหญ่สุด": "A moment's first photo gets used biggest",
  "เวลาเลือกรูปหลายใบ ให้ใบที่เล่าเรื่องนั้นได้ดีที่สุดมาก่อน เพราะเล่มจะเอาใบแรกไปวางเป็นภาพนำของบล็อกนั้น (และอาจถูกใช้เป็นภาพเปิดวัน)": "When picking several, put the one that tells the story first — the book uses it as that block's lead image, and possibly as the day's opening page.",
  "ให้มีรูปแนวนอนวันละใบสองใบ": "Keep one or two landscape shots per day",
  "หน้าเปิดวันกับปกเป็นภาพเต็มหน้าแนวนอน — ถ้าวันนั้นมีแต่รูปตั้ง หน้าเต็มจะต้องครอบภาพเยอะกว่าปกติ มีรูปนอนสักใบไว้ก็ช่วยได้มาก (หรือปรับกรอบใบนั้นเองในหน้าแก้เล่ม)": "Day openers and covers are full-page landscape — if a day has only portrait shots, the full page has to crop more. One landscape photo helps a lot (or re-frame it yourself in the edit screen).",
  "รูปป้าย เมนู ตัวหนังสือ ให้เผื่อขอบไว้": "Leave margins around signs, menus, and text",
  "ถ่ายให้มีที่ว่างรอบตัวหนังสือหน่อย อ่านง่ายกว่าเวลาย่อลงในเล่ม และถ้าถูกวางในช่องเล็กก็ยังเห็นครบ": "A little space around the lettering reads better when scaled down, and stays legible in a small slot.",
  "เวลาในโมเมนต์ต้องตรง เล่มจึงเรียงถูก": "Correct times mean correct order",
  "เล่มจัดวันและลำดับตามช่อง “วันและเวลาที่เกิดขึ้นจริง” ถ้าจดย้อนหลังให้กดปุ่มปฏิทินบนรูปเพื่อดึงเวลาจากรูปมาใส่ — เรื่องจะไม่สลับวันกัน": "The book orders days and moments by the \"actual date and time\" field. Logging later? Tap the calendar button on a photo to pull its timestamp — then nothing lands on the wrong day.",
  "รูปซ้ำๆ ใส่ใบเดียวพอ": "One shot per subject is enough",
  "โฟโต้บุ๊กใช้รูปได้ถึง 6 ใบต่อโมเมนต์ อีบุ๊กใช้ 3 ใบแรก — เลือกใบที่ต่างกันจริงๆ ดีกว่าใส่มุมเดิมสามสี่ใบ เพราะหน้ารวมรูปจะดูซ้ำ · รูปชุดนี้ยังถูกใช้ทำคลิปสรุปทริปด้วย": "A photo book uses up to 6 photos per moment, an ebook the first 3 — genuinely different shots beat four angles of the same thing, or the grid pages look repetitive · this set also feeds the recap clip.",
  "โน้ตสั้น–ยาว ทำให้หน้าไม่เหมือนกัน": "Short and long notes change the layout",
  "โน้ตสั้น (ไม่เกิน ~230 ตัวอักษร) จะได้รูปวางคู่ข้อความ โน้ตยาวจะได้รูปเต็มความกว้างแล้วข้อความไหลต่อ — เขียนสลับสั้นยาวบ้าง เล่มจะมีจังหวะน่าอ่าน": "Short notes (under ~230 characters) get a photo beside the text; long ones get a full-width photo with the text flowing after — mixing lengths gives the book a readable rhythm.",
  "แก้เล่มที่ทำแล้วได้ไหม": "Can I edit a book I've made?",
  "ได้ ก่อนกดทำเล่มมีหน้าแก้เล่มให้ปรับ 4 อย่าง:": "Yes — before building there's an edit screen with four controls:",
  "กรอบรูป": "framing",
  "(ซูมและเลื่อนจุดโฟกัสของแต่ละใบ) ·": "(zoom and reposition each photo) ·",
  "เลย์เอาต์": "layout",
  "ของแต่ละรูป (เต็มหน้า / เดี่ยว / คู่ / กริด) ·": "per photo (full page / single / pair / grid) ·",
  "ลำดับหน้า": "page order",
  "ในแต่ละวัน ·": "within each day ·",
  "(ครีม ขาว เข้ม) — ค่าที่ปรับไว้จำไว้ให้ ทำเล่มใหม่ก็ไม่ต้องตั้งซ้ำ ส่วนเนื้อหา (โน้ต ชื่อวัน ปก) ยังแก้ที่ต้นทางแล้วทำเล่มใหม่": "(cream, white, dark) — your settings are remembered, so rebuilding doesn't mean redoing them. Content (notes, day titles, cover) is edited at the source, then rebuild.",
  "มีรูปที่ไม่อยากให้อยู่ในเล่ม": "There's a photo I don't want in the book",
  "ไม่ต้องลบรูปทิ้ง — ในหน้าแก้เล่มมีช่องติ๊กว่าโมเมนต์ไหนจะเข้าเล่ม เอาติ๊กออกก็ไม่เข้าเล่มแต่ยังอยู่ในทริป · ถ้าอยากเอาออกทั้งใบก็ลบที่โมเมนต์ได้ (แก้ไขโมเมนต์ → กดกากบาทบนรูป)": "No need to delete it — the edit screen has tick boxes for which moments go in. Untick one and it stays in the trip but out of the book · to remove a photo entirely, delete it in the moment (edit moment → tap the × on the photo).",
  "ทำไมบางวันไม่มีในเล่ม": "Why is a day missing from the book?",
  "วันที่ไม่มีโมเมนต์และไม่มีเรื่องเล่าจะถูกข้ามไป เพื่อไม่ให้เล่มมีหน้าว่าง — ถ้าอยากให้วันนั้นอยู่ในเล่ม เพิ่มโน้ตหรือรูปสักอย่างในวันนั้นก่อน": "Days with no moments and no story are skipped so the book has no blank pages — add a note or a photo to that day and it comes in.",
  "เอาไปสั่งพิมพ์เป็นเล่มจริงได้ไหม": "Can I have it printed for real?",
  "ได้ ก่อนทำเล่มให้เลือก": "Yes — before building, choose",
  "คุณภาพไฟล์ → สำหรับพิมพ์": "file quality → print",
  "แล้วกดบันทึกเป็น PDF ส่งให้ร้าน (โหมด “อ่านบนจอ” บีบรูปให้ไฟล์เล็กสำหรับส่งไลน์/อีเมล) ขนาดหน้าเป็น A5 มาตรฐาน — โฟโต้บุ๊กแนวนอน อีบุ๊กแนวตั้ง ถ้าร้านขอเผื่อขอบตัดตก แจ้งว่าเป็นไฟล์ขนาดจริงไม่มีเบรีด · หมายเหตุ: แอปย่อรูปตอนบันทึกเพื่อไม่ให้กินที่เครื่อง เล่มจึงคมพอสำหรับ A5 ทั่วไป แต่ยังไม่เท่างานพิมพ์คุณภาพสูง": "then save the PDF and send it over (\"read on screen\" compresses photos for chat and email). Pages are standard A5 — landscape for photo books, portrait for ebooks. If the printer asks about bleed, tell them it's trim-size with none · note: the app resizes photos on save to spare device storage, so books are sharp enough for ordinary A5 printing but not fine-art quality.",
  "ต้องเป็นพรีเมียมไหม": "Do I need Premium?",
  "ไม่ต้อง ทำเล่มได้เต็มทั้งเล่ม ปรับกรอบ เลย์เอาต์ ธีม และบันทึก PDF ได้ ไม่จำกัดจำนวนครั้ง · อ่านในแอปสะอาดไม่มีอะไรมาบัง สิ่งเดียวที่ต่างคือไฟล์ที่": "No — full books, framing, layouts, themes, and PDF saves, unlimited · it reads clean in the app. The only difference is that files you",
  "มีบรรทัดเล็กๆ “สร้างด้วย Vela · onevela.net” อยู่มุมล่างของหน้าเนื้อหา (ไม่มีบนปก) — พรีเมียมเอาบรรทัดนั้นออกให้": "carry a small \"Made with Vela · onevela.net\" line at the bottom of content pages (never on the cover) — Premium removes it.",
  "ทำเป็นคลิปสั้นลงโซเชียลได้ไหม": "Can I make a short clip for social?",
  "ได้ ที่แท็บ “ฉัน” → รีแคป แอปจะเลือกรูปเด่นจากทั้งทริป (เน้นโมเมนต์ที่คุณติ๊กไว้ให้เข้าเล่ม) มาต่อเป็นคลิปแนวตั้ง 45–60 วินาที พอดีกับ Reels และ TikTok ทำกี่ครั้งก็ได้ · พรีเมียมเลือกรูปเอง เรียงลำดับเอง และทำคลิปยาวเท่าไหร่ก็ได้": "Yes — \"Me\" tab → Recap. The app picks the strongest photos from the trip (favouring the moments you ticked for the book) and cuts a 45–60 second vertical clip for Reels and TikTok, as often as you like · Premium lets you pick the photos, set the order, and make it any length.",
  "เล่มที่ทำแล้วเก็บไว้ที่ไหน": "Where are finished books kept?",
  "อยู่ในชั้นหนังสือที่แท็บ “ฉัน” → ปุ่มหนังสือ กดเปิดอ่านใหม่ได้ทุกเมื่อ เล่มอยู่ในแอปของคุณ ไม่ได้เผยแพร่ให้คนอื่นเห็น": "On the shelf in the \"Me\" tab → Books. Open one anytime; books live in your app and aren't published to anyone.",
  "ทริปที่ผ่านมาลองทำเป็นเล่มดู": "Try making a book from a past trip",
  "ข้อมูลที่จดไว้แล้วก็พอ ไม่ต้องเพิ่มอะไรใหม่": "What you already logged is enough — nothing new to add",
  "เช็คอินและโมเมนต์": "Check-ins & moments"
});

Object.assign(window.VELA_WEB_EN, {
  "รวมรูป": "with photos",
  "วันและเวลาที่เกิดขึ้นจริง": "Actual date and time",
  "กด": "Tap",
  "ติดตั้งแอป": "Install app"
});
