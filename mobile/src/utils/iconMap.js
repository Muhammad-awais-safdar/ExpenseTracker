export const iconMap = {
  // Money & Wallet
  money: "cash-outline",
  cash: "cash-outline",
  wallet: "wallet-outline",
  salary: "wallet-outline",
  income: "wallet-outline",
  savings: "wallet-outline",
  deposit: "arrow-down-circle-outline",
  withdraw: "arrow-up-circle-outline",

  // Food & Drink
  food: "fast-food-outline",
  drink: "cafe-outline",
  coffee: "cafe-outline",
  restaurant: "restaurant-outline",
  dining: "restaurant-outline",
  groceries: "cart-outline",
  grocery: "cart-outline",
  snacks: "pizza-outline",
  lunch: "fast-food-outline",
  dinner: "restaurant-outline",

  // Transport
  transport: "bus-outline",
  fuel: "car-outline",
  gas: "car-outline",
  petrol: "car-outline",
  taxi: "car-outline",
  uber: "car-outline",
  careem: "car-outline",
  bus: "bus-outline",
  train: "train-outline",
  flight: "airplane-outline",
  travel: "airplane-outline",
  vehicle: "car-sport-outline",

  // Utilities & Bills
  utilities: "flash-outline",
  bills: "receipt-outline",
  electricity: "flash-outline",
  bolt: "flash-outline", // User mentioned 'bolt'
  water: "water-outline",
  gas_bill: "flame-outline",
  internet: "wifi-outline",
  wifi: "wifi-outline",
  phone: "call-outline",
  mobile: "phone-portrait-outline",
  rent: "home-outline",
  maintenance: "build-outline",

  // Shopping & Entertainment
  shopping: "bag-handle-outline",
  clothes: "shirt-outline",
  shoes: "footsteps-outline",
  entertainment: "film-outline",
  movie: "videocam-outline",
  music: "musical-notes-outline",
  games: "game-controller-outline",
  netflix: "tv-outline",
  subscription: "calendar-outline",

  // Health & Education
  health: "medkit-outline",
  medical: "medkit-outline",
  doctor: "medkit-outline",
  medicine: "bandage-outline",
  gym: "barbell-outline",
  fitness: "fitness-outline",
  sports: "football-outline",
  education: "school-outline",
  school: "school-outline",
  tuition: "book-outline",
  books: "book-outline",
  course: "library-outline",

  // Personal & Others
  gift: "gift-outline",
  charity: "heart-outline",
  donation: "heart-outline",
  family: "people-outline",
  kids: "happy-outline",
  baby: "happy-outline",
  personal: "person-outline",
  beauty: "rose-outline",
  salon: "cut-outline",
  work: "briefcase-outline",
  business: "briefcase-outline",
  office: "business-outline",
  loan: "swap-horizontal-outline",
  debt: "alert-circle-outline",
  tax: "document-text-outline",
  insurance: "shield-checkmark-outline",
  investment: "trending-up-outline",

  // Generic
  expense: "card-outline",
  other: "ellipsis-horizontal-circle-outline",
  general: "apps-outline",
  default: "help-circle-outline",
};

export const getValidIconName = (name) => {
  if (!name) return iconMap.default;

  // 1. Exact Match (Cleaned)
  const cleanName = name.toLowerCase().trim().replace(/_/g, " "); // 'gas_bill' -> 'gas bill'

  // Check exact key first (e.g. 'food')
  if (iconMap[cleanName]) return iconMap[cleanName];

  // Check original input lowercased
  const lowerName = name.toLowerCase().trim();
  if (iconMap[lowerName]) return iconMap[lowerName];

  // 2. Partial Match / Keyword Search
  // If the category is "Month's Rent", we want to find "rent"
  const keywords = Object.keys(iconMap);
  for (const keyword of keywords) {
    if (cleanName.includes(keyword) && keyword.length > 3) {
      // Avoid matching 'gas' in 'vegas' inaccurately if short
      return iconMap[keyword];
    }
  }

  // 3. Last Resort: Is it already a valid ionicon name?
  if (name.includes("-outline") || name.includes("-sharp")) return name;
  if (name.includes("-")) return name + "-outline"; // Try appending outline if it looks like an icon name

  return iconMap.default;
};
