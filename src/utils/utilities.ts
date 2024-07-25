function capitalize(input: string): string {
    if (!input) return ''; // Return an empty string if input is falsy

    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}


export { capitalize }