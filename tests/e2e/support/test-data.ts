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

export function newAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: 'Dana Olsen',
    email: uniqueEmail(),
    password: 'secret123',
    ...overrides,
  };
}
