/* Synthetic demo data. Money is stored in piasters (EGP x 100). */
const E = (n) => n * 100;
const B = (ar, en) => ({ ar, en });

const AREAS = {
  nc: B('القاهرة الجديدة', 'New Cairo'),
  sz: B('الشيخ زايد', 'Sheikh Zayed'),
  sh: B('الشروق', 'El Shorouk'),
};
const TYPES = { apt: B('شقة', 'Apartment'), villa: B('فيلا', 'Villa'), duplex: B('دوبلكس', 'Duplex') };
const GRAD = [
  'linear-gradient(135deg,#14213F,#A27E3E)', 'linear-gradient(135deg,#22305A,#C8A464)',
  'linear-gradient(135deg,#0B1530,#6B675F)', 'linear-gradient(135deg,#846429,#14213F)',
  'linear-gradient(135deg,#3b4a73,#E4CE9C)', 'linear-gradient(135deg,#070E1F,#22305A)',
];

const AUCTIONS = [
  { id: 'a1', status: 'live', area: 'nc', type: 'apt', title: B('شقة ٣ غرف، كمبوند ميفيدا', '3-bed apartment, Mivida compound'), beds: 3, size: 165,
    start: E(3200000), deposit: E(50000), steps: [E(10000), E(25000), E(50000)], g: 0, bots: 6, secs: 40 },
  { id: 'a2', status: 'live', area: 'sz', type: 'villa', title: B('فيلا مستقلة، كمبوند بيفرلي هيلز', 'Standalone villa, Beverly Hills compound'), beds: 5, size: 420,
    start: E(14500000), deposit: E(150000), steps: [E(50000), E(100000), E(250000)], g: 1, bots: 6, secs: 40 },
  { id: 'a3', status: 'upcoming', area: 'nc', type: 'duplex', title: B('دوبلكس بحديقة، كمبوند ريفان', 'Garden duplex, Rivan compound'), beds: 4, size: 260,
    start: E(7800000), deposit: E(80000), steps: [E(25000), E(50000), E(100000)], g: 2, startsIn: '٢ س / 2h' },
  { id: 'a4', status: 'upcoming', area: 'sz', type: 'apt', title: B('شقة ٢ غرفة، كمبوند زيد إيست', '2-bed apartment, Zed East compound'), beds: 2, size: 120,
    start: E(2700000), deposit: E(40000), steps: [E(10000), E(25000), E(50000)], g: 3, startsIn: '٦ س / 6h' },
  { id: 'a5', status: 'ended', area: 'sh', type: 'apt', title: B('شقة ٣ غرف، كمبوند الشروق سيتي', '3-bed apartment, Shorouk City compound'), beds: 3, size: 150,
    start: E(2400000), deposit: E(30000), steps: [E(10000)], g: 4, final: E(2950000) },
];

const LISTINGS = [
  { id: 'l1', area: 'nc', type: 'apt', title: B('شقة بإطلالة حديقة، كمبوند ذا ٩٠', 'Garden-view apartment, The 90 compound'), price: E(5400000), beds: 3, baths: 2, size: 180, g: 0, status: 'approved' },
  { id: 'l2', area: 'nc', type: 'villa', title: B('فيلا توين هاوس، كمبوند ميفيدا', 'Twin house villa, Mivida compound'), price: E(11800000), beds: 4, baths: 4, size: 330, g: 1, status: 'approved' },
  { id: 'l3', area: 'sz', type: 'apt', title: B('شقة جاهزة للسكن، كمبوند زيد وست', 'Ready-to-move apartment, Zed West compound'), price: E(4200000), beds: 2, baths: 2, size: 135, g: 2, status: 'approved' },
  { id: 'l4', area: 'sz', type: 'villa', title: B('فيلا مستقلة بحمام سباحة، بيفرلي هيلز', 'Standalone villa with pool, Beverly Hills'), price: E(17500000), beds: 5, baths: 5, size: 450, g: 3, status: 'approved' },
  { id: 'l5', area: 'sh', type: 'apt', title: B('شقة بنتهاوس، كمبوند ديار', 'Penthouse apartment, Diar compound'), price: E(3100000), beds: 3, baths: 2, size: 170, g: 4, status: 'approved' },
  { id: 'l6', area: 'nc', type: 'duplex', title: B('دوبلكس بروف، كمبوند ريفان', 'Roof duplex, Rivan compound'), price: E(8900000), beds: 4, baths: 3, size: 240, g: 5, status: 'approved' },
  { id: 'l7', area: 'sz', type: 'apt', title: B('شقة استوديو، كمبوند ذا إيدج', 'Studio apartment, The Edge compound'), price: E(1900000), beds: 1, baths: 1, size: 75, g: 2, status: 'approved' },
  { id: 'l8', area: 'nc', type: 'apt', title: B('شقة ركنية، كمبوند تاج سيتي', 'Corner apartment, Taj City compound'), price: E(6300000), beds: 3, baths: 3, size: 200, g: 1, status: 'pending', owner: B('ملاك الجديد', 'New Cairo Homes (seller)') },
];

const RENTALS = [
  { id: 'r1', area: 'nc', type: 'apt', title: B('شقة مفروشة، كمبوند مدينتي', 'Furnished apartment, Madinaty-style compound'), rent: E(32000), beds: 2, size: 130, g: 0, furnished: true },
  { id: 'r2', area: 'sz', type: 'apt', title: B('شقة غير مفروشة، زيد إيست', 'Unfurnished apartment, Zed East'), rent: E(24000), beds: 3, size: 160, g: 2, furnished: false },
  { id: 'r3', area: 'nc', type: 'villa', title: B('فيلا للإيجار، ميفيدا', 'Villa for rent, Mivida'), rent: E(85000), beds: 4, size: 350, g: 1, furnished: false },
  { id: 'r4', area: 'sh', type: 'apt', title: B('شقة بحديقة خاصة، الشروق', 'Apartment with private garden, El Shorouk'), rent: E(18000), beds: 2, size: 120, g: 4, furnished: true },
];

const INVEST = [
  { id: 'i1', area: 'nc', title: B('مبنى إداري وتجاري، التجمع الخامس', 'Office & retail building, Fifth Settlement'), ticket: E(250000), yieldPct: 11.5, term: 5, funded: 72, g: 5 },
  { id: 'i2', area: 'sz', title: B('وحدات فندقية مُدارة، الشيخ زايد', 'Managed serviced units, Sheikh Zayed'), ticket: E(500000), yieldPct: 14, term: 7, funded: 38, g: 3 },
  { id: 'i3', area: 'nc', title: B('محلات تجارية بمول، القاهرة الجديدة', 'Mall retail shops, New Cairo'), ticket: E(150000), yieldPct: 9.8, term: 4, funded: 91, g: 0 },
  { id: 'i4', area: 'sh', title: B('شقق للإيجار طويل الأجل، الشروق', 'Long-let apartments block, El Shorouk'), ticket: E(100000), yieldPct: 8.2, term: 3, funded: 55, g: 4 },
];

const BOT_NAMES = ['م. ٤٢١', 'م. ٧٧٠', 'م. ١٣٥', 'م. ٩٠٨', 'م. ٣٦٢'];
const BOT_NAMES_EN = ['B-421', 'B-770', 'B-135', 'B-908', 'B-362'];

const SEED_ADMIN_IDS = [
  { id: 'u-101', name: B('سلمى حسن', 'Salma Hassan'), phone: '+20 100 555 0101' },
  { id: 'u-102', name: B('كريم فؤاد', 'Karim Fouad'), phone: '+20 111 555 0102' },
];
