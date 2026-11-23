// The backend keeps its data in memory, so every run needs a unique email.
let counter = 0;

export function uniqueEmail(): string {
  counter += 1;
  return `ui-${Date.now()}-${process.pid}-${counter}@example.com`;
}

export interface Account {
  name: string;
  email: string;
  password: string;
}

export interface TripDetails {
  cityFrom: string;
  cityTo: string;
  startDate: string;
  endDate: string;
}

export function newTrip(overrides: Partial<TripDetails> = {}): TripDetails {
  return {
    cityFrom: 'Copenhagen',
    cityTo: 'Lisbon',
    startDate: '2027-03-10',
    endDate: '2027-03-15',
    ...overrides,
  };
}

export interface ItemDetails {
  category: string;
  amount: string;
  description: string;
}

export function newItem(overrides: Partial<ItemDetails> = {}): ItemDetails {
  return {
    category: 'Food',
    amount: '250',
    description: 'Dinner in Lisbon',
    ...overrides,
  };
}

export function newAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: 'Dana Olsen',
    email: uniqueEmail(),
    password: 'secret123',
    ...overrides,
  };
}
