type Header = {
    title: string;
    type: string;
};

export function generateHeaderClass(headers: Header[]): string {
    // Start creating the type definition as a string
    let typeDefinition = 'export type Header = {\n';

    // Iterate over the headers and assign the specified types
    headers.forEach(header => {
        // Ensure that the type is valid for TypeScript
        const type = header.type.replace(/\b(?:string|number|boolean|Date|any)\b/g, match => match); // Ensure the type is valid
        typeDefinition += `  ${header.title}: ${type};\n`;
    });

    // Close the type definition
    typeDefinition += '};';

    return typeDefinition;
}

