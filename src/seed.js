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
      ['Flights', 1850, 'Return flights CPH-LIS'],
      ['Accommodation', 3200, '5 nights, hotel in Alfama'],
      ['Activities', 450, 'Sintra day trip tickets'],
      ['Activities', 220, 'Belem Tower and monastery'],
      ['Food', 300, 'Dinner and pasteis de nata'],
      ['Food', 380, 'Seafood dinner'],
      ['Transport', 180, '72h metro and tram pass'],
      ['Travel insurance', 250, 'Short trip policy'],
      ['Extras', 400, 'Souvenirs'],
    ],
  },
  {
    owner: 1,
    cityFrom: 'Copenhagen',
    cityTo: 'Rome',
    startDate: '2026-06-20',
    endDate: '2026-06-27',
    items: [
      ['Flights', 2400, 'Return flights CPH-FCO'],
      ['Accommodation', 5600, '7 nights, apartment near Termini'],
      ['Activities', 700, 'Colosseum and Forum skip-the-line'],
      ['Activities', 500, 'Vatican Museums'],
      ['Food', 450, 'Trattoria dinner'],
      ['Food', 520, 'Food tour in Trastevere'],
      ['Transport', 350, 'Airport train and weekly transit pass'],
      ['Travel insurance', 420, 'Annual policy share'],
      ['Extras', 300, 'Gelato budget'],
    ],
  },
  {
    owner: 2,
    cityFrom: 'Aarhus',
    cityTo: 'Barcelona',
    startDate: '2026-09-05',
    endDate: '2026-09-10',
    items: [
      ['Flights', 2100, 'Return flights AAR-BCN via Copenhagen'],
      ['Accommodation', 4100, '5 nights, hostel private room'],
      ['Activities', 600, 'Sagrada Familia and Park Guell'],
      ['Food', 650, 'Tapas evenings'],
      ['Transport', 200, 'T-casual 10 trip card'],
      ['Transport', 120, 'Train to Girona'],
      ['Travel insurance', 280, 'Medical and luggage cover'],
      ['Extras', 350, 'Beach day and souvenirs'],
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
    for (const [category, amount, description] of t.items) {
      items.create({ tripId: trip.id, category, amount, description });
    }
  }
}

module.exports = seed;
