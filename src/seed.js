const bcrypt = require('bcryptjs');
const users = require('./models/user.model');
const trips = require('./models/trip.model');
const items = require('./models/budgetItem.model');

const USERS = [
  { name: 'Alice Jensen', email: 'alice@example.com', password: 'alice123' },
  { name: 'Bob Nielsen', email: 'bob@example.com', password: 'bob12345' },
  { name: 'Carla Hansen', email: 'carla@example.com', password: 'carla123' },
];

// One trip per user. Amounts are in DKK.
const TRIPS = [
  {
    owner: 0,
    cityFrom: 'Copenhagen',
    cityTo: 'Lisbon',
    startDate: '2026-03-10',
    endDate: '2026-03-15',
    items: [
      ['Flights', 1850, 'Return flights CPH-LIS', '2026-03-10'],
      ['Accommodation', 3200, '5 nights, hotel in Alfama', '2026-03-10'],
      ['Activities', 450, 'Sintra day trip tickets', '2026-03-12'],
      ['Activities', 220, 'Belem Tower and monastery', '2026-03-13'],
      ['Food', 300, 'Dinner and pasteis de nata', '2026-03-11'],
      ['Food', 380, 'Seafood dinner', '2026-03-13'],
      ['Transport', 180, '72h metro and tram pass', '2026-03-10'],
      ['Travel insurance', 250, 'Short trip policy', '2026-03-10'],
      ['Extras', 400, 'Souvenirs', '2026-03-14'],
    ],
  },
  {
    owner: 1,
    cityFrom: 'Copenhagen',
    cityTo: 'Rome',
    startDate: '2026-06-20',
    endDate: '2026-06-27',
    items: [
      ['Flights', 2400, 'Return flights CPH-FCO', '2026-06-20'],
      ['Accommodation', 5600, '7 nights, apartment near Termini', '2026-06-20'],
      ['Activities', 700, 'Colosseum and Forum skip-the-line', '2026-06-22'],
      ['Activities', 500, 'Vatican Museums', '2026-06-24'],
      ['Food', 450, 'Trattoria dinner', '2026-06-21'],
      ['Food', 520, 'Food tour in Trastevere', '2026-06-23'],
      ['Transport', 350, 'Airport train and weekly transit pass', '2026-06-20'],
      ['Travel insurance', 420, 'Annual policy share', '2026-06-20'],
      ['Extras', 300, 'Gelato budget', '2026-06-25'],
    ],
  },
  {
    owner: 2,
    cityFrom: 'Aarhus',
    cityTo: 'Barcelona',
    startDate: '2026-09-05',
    endDate: '2026-09-10',
    items: [
      ['Flights', 2100, 'Return flights AAR-BCN via Copenhagen', '2026-09-05'],
      ['Accommodation', 4100, '5 nights, hostel private room', '2026-09-05'],
      ['Activities', 600, 'Sagrada Familia and Park Guell', '2026-09-07'],
      ['Food', 650, 'Tapas evenings', '2026-09-08'],
      ['Transport', 200, 'T-casual 10 trip card', '2026-09-05'],
      ['Transport', 120, 'Train to Girona', '2026-09-09'],
      ['Travel insurance', 280, 'Medical and luggage cover', '2026-09-05'],
      ['Extras', 350, 'Beach day and souvenirs', '2026-09-09'],
    ],
  },
];

function seed() {
  const created = USERS.map((u) =>
    users.create({
      name: u.name,
      email: u.email,
      passwordHash: bcrypt.hashSync(u.password, 10),
    })
  );

  for (const t of TRIPS) {
    const trip = trips.create({
      userId: created[t.owner].id,
      cityFrom: t.cityFrom,
      cityTo: t.cityTo,
      startDate: t.startDate,
      endDate: t.endDate,
    });
    for (const [category, amount, description, date] of t.items) {
      items.create({ tripId: trip.id, category, amount, description, date });
    }
  }
}

module.exports = seed;
