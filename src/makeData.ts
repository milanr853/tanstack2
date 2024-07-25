import { faker } from '@faker-js/faker';

// Define the Person type || column headers
export type Person = {
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
    progress: number;
};

// Function to generate random Person data || column body data
export function makeData(count: number): Person[] {
    const data: Person[] = [];

    for (let i = 0; i < count; i++) {
        const person: Person = {
            firstName: faker.name.firstName(),  // Generate a random first name
            lastName: faker.name.lastName(),    // Generate a random last name
            age: faker.datatype.number({ min: 18, max: 80 }), // Random age between 18 and 80
            visits: faker.datatype.number({ min: 0, max: 500 }), // Random number of visits
            status: faker.helpers.arrayElement(['Single', 'In Relationship', 'Complicated', 'Married']), // Random status
            progress: faker.datatype.number({ min: 0, max: 100 }) // Random progress percentage
        };
        data.push(person);
    }

    return data;
}

//column headers | column parameters
//column body data
//column schema