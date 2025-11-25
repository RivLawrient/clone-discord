// Ganti dengan path file yang sesuai

import { ChatList } from "@/app/(home)/_components/chat/useTextChannelView";
import { USER_STATUS, UserOther } from "@/app/(home)/_state/user-atom";

// --- Daftar Nama, Aksi, dan Warna untuk Variasi Data ---
const NAMES = [
  "Alisa",
  "Bima",
  "Citra",
  "Dian",
  "Eka",
  "Fahmi",
  "Gita",
  "Hendra",
  "Irma",
  "Joko",
  "Kartika",
  "Lukman",
  "Maya",
  "Naufal",
  "Olivia",
  "Pandu",
  "Qori",
  "Rina",
  "Seto",
  "Tika",
  "Umar",
  "Vina",
  "Willy",
  "Xena",
  "Yoga",
  "Zahra",
];

const LAST_NAMES = [
  "Cahyani",
  "Santosa",
  "Dewi",
  "Pratama",
  "Sari",
  "Ahmad",
  "Putra",
  "Hadi",
  "Kusuma",
  "Wijaya",
];

const CHAT_ACTIONS = [
  "sudah melihat pembaruan terbaru di repo?",
  "desain mock-up untuk halaman login sudah selesai saya kirim ya.",
  "Saya akan memeriksa draft artikel besok pagi.",
  "Dataset Q3 sudah siap untuk diolah.",
  "Ingat, besok deadline proyek! Semangat!",
  "Bagaimana progres integrasi API yang baru?",
  "Ada yang bisa bantu saya di bagian _styling_ CSS?",
  "Jadwal rapat diundur menjadi jam 3 sore. Mohon diperhatikan.",
  "Dokumen spesifikasi sudah diunggah ke Drive bersama.",
  "Terima kasih atas bantuannya! Sangat membantu.",
  "Sedang mengalami _bug_ di modul pembayaran.",
  "Apakah Anda sudah mengkonfirmasi kehadiran di acara tersebut?",
  "Ide Anda menarik, mari kita diskusikan lebih lanjut.",
  "Tolong cek _pull request_ yang baru saya buat.",
];

const HEX_COLORS = [
  "#1e90ff",
  "#3cb371",
  "#ff6347",
  "#4682b4",
  "#ff8c00",
  "#00ced1",
  "#da70d6",
  "#ffd700",
  "#a9a9a9",
];

const STATUS_KEYS = Object.keys(USER_STATUS) as (keyof typeof USER_STATUS)[];

// --- Fungsi Pembantu untuk Mendapatkan Nilai Acak ---
const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// --- 1. Fungsi untuk Menghasilkan UserOther (minimal 100) ---
export const generateDummyUsers = (count: number): UserOther[] => {
  const users: UserOther[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = getRandomElement(NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}${getRandomInt(1, 99)}`;

    users.push({
      user_id: `user-${String(i).padStart(3, "0")}`,
      name: fullName,
      username: username,
      avatar: `https://i.pravatar.cc/150?img=${getRandomInt(1, 70)}`, // Variasi avatar
      avatar_bg: getRandomElement(HEX_COLORS),
      status_activity: getRandomElement(STATUS_KEYS),
      bio: `Hanya seorang ${getRandomElement(["developer", "desainer", "analis", "manajer", "spesialis data"])} di kota ${getRandomElement(["Jakarta", "Bandung", "Surabaya"])}.`,
      banner_color: getRandomElement(HEX_COLORS),
    });
  }
  return users;
};

// --- 2. Fungsi untuk Menghasilkan ChatList (minimal 100) ---
export const generateDummyChatList = (
  users: UserOther[],
  count: number
): ChatList[] => {
  const chatList: ChatList[] = [];
  const startDate = new Date(2025, 10, 1); // 1 Nov 2025
  const endDate = new Date(); // Hari ini

  for (let i = 1; i <= count; i++) {
    const randomUser = getRandomElement(users);
    const randomText = `[${randomUser.name}] ${getRandomElement(CHAT_ACTIONS)}`;
    const randomDate = getRandomDate(startDate, endDate);

    chatList.push({
      id: `chat-${String(i).padStart(3, "0")}`,
      user: randomUser,
      text: randomText,
      created_at: randomDate.toISOString(),
    });
  }
  return chatList;
};

// --- PENGGUNAAN UTAMA ---
const USER_COUNT = 110; // Menghasilkan 110 user unik
const CHAT_COUNT = 100; // Menghasilkan 150 entri chat (menggunakan user dari array di atas)

export const DUMMY_USERS_110 = generateDummyUsers(USER_COUNT);
export const DUMMY_CHAT_LIST_150 = generateDummyChatList(
  DUMMY_USERS_110,
  CHAT_COUNT
);

console.log(`Berhasil membuat ${DUMMY_USERS_110.length} user unik.`);
console.log(`Berhasil membuat ${DUMMY_CHAT_LIST_150.length} entri chat list.`);
// Anda bisa log DUMMY_CHAT_LIST_150 untuk melihat hasilnya
// console.log(DUMMY_CHAT_LIST_150);
