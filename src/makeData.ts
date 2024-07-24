import { faker } from '@faker-js/faker';

export type Athlete = {
    userId: string;
    name: string;
    age: number;
    country: string;
    year: number;
    date: string;
    sport: string;
    totalMedals: number;
};

const sports = [
    'Athletics',
    'Swimming',
    'Gymnastics',
    'Cycling',
    'Weightlifting',
    'Boxing',
    'Wrestling',
    'Fencing',
    'Judo',
    'Shooting',
];

const countries = [
    'USA',
    'China',
    'Russia',
    'Japan',
    'Germany',
    'Australia',
    'France',
    'Italy',
    'UK',
    'Canada',
];

export function makeData(num: number): Athlete[] {
    const data: Athlete[] = [];

    for (let i = 0; i < num; i++) {
        data.push({
            userId: faker.datatype.uuid(),
            name: faker.name.fullName(),
            age: faker.datatype.number({ min: 18, max: 40 }),
            country: faker.helpers.arrayElement(countries),
            year: faker.date.past(30, new Date()).getFullYear(), // past 30 years
            date: faker.date.past(30, new Date()).toLocaleDateString(),
            sport: faker.helpers.arrayElement(sports),
            totalMedals: faker.datatype.number({ min: 0, max: 20 }),
        });
    }

    return data;
}
