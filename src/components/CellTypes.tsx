import React from 'react'

// Edit off
function NoEditCell({ info }: any) {
    return (
        <div className="whitespace-nowrap">{info.getValue()}</div> // Display without editing functionality
    );
}

// Alphabet only input
function TextInputCell({ info, updateData }: any) {
    return (
        <input
            value={info.getValue()}
            onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z]*$/.test(value)) { // Alphabetic characters only
                    updateData(info.row.index, info.column.id, value);
                }
            }}
            onBlur={() => updateData(info.row.index, info.column.id, info.getValue())}
            className="border p-1"
        />
    );
}

// Number only input
function NumberInputCell({ info, updateData }: any) {
    return (
        <input
            type="number"
            value={info.getValue()}
            onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(Number(value)) && value.trim() !== '') {
                    updateData(info.row.index, info.column.id, Number(value));
                }
            }}
            onBlur={() => updateData(info.row.index, info.column.id, info.getValue())}
            className="border p-1"
        />
    );
}

// Checkbox (Select Box)
function CheckBoxCell({ info, updateData, options }: any) {
    return (
        <select
            value={info.getValue()}
            onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
            className="border p-1 bg-white rounded-md shadow-sm"
        >
            {
                options.map((option: string) => <option key={option} value={option}>{option}</option>)
            }
        </select>
    );
}

// Progress bar
function ProgressBarCell({ info }: any) {
    const getColor = (value: number) => {
        if (value <= 25) return 'bg-red-500';
        if (value <= 50) return 'bg-yellow-500';
        if (value <= 75) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="flex items-center">
            <div className="w-full">
                <div
                    className={`h-5 ${getColor(info.getValue())} rounded-md`}
                    style={{ width: `${info.getValue()}%`, transition: 'width 0.3s' }}
                />
            </div>
            <div className="ml-1 text-sm">{`${info.getValue()}/100`}</div>
        </div>
    );
}

// Email
function EmailCell({ info, updateData }: any) {
    return (
        <input
            type="email"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
            onBlur={() => {
                const email = info.getValue();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    updateData(info.row.index, info.column.id, email);
                } else {
                    alert('Invalid email format');
                }
            }}
            className="border p-1"
        />
    );
}

// URL
function UrlCell({ info, updateData }: any) {
    return (
        <input
            type="url"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
            onBlur={() => {
                const url = info.getValue();
                try {
                    new URL(url);
                    updateData(info.row.index, info.column.id, url);
                } catch {
                    alert('Invalid URL format');
                }
            }}
            className="border p-1"
        />
    );
}

// Date and Time
function DateTimeCell({ info, updateData }: any) {
    return (
        <input
            type="datetime-local"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
            onBlur={() => updateData(info.row.index, info.column.id, info.getValue())}
            className="border p-1"
        />
    );
}

// Radio button
function RadioCell({ info, updateData }: any) {
    return (
        <div className="flex space-x-4">
            <label>
                <input
                    type="radio"
                    value="Male"
                    checked={info.getValue() === 'Male'}
                    onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
                />
                Male
            </label>
            <label>
                <input
                    type="radio"
                    value="Female"
                    checked={info.getValue() === 'Female'}
                    onChange={(e) => updateData(info.row.index, info.column.id, e.target.value)}
                />
                Female
            </label>
        </div>
    );
}

// Mobile number
function MobileNumberInputCell({ info, updateData }: any) {
    return (
        <input
            type="tel"
            value={info.getValue()}
            onChange={(e) => {
                const value = e.target.value;
                if (/^\+?\d{10,15}$/.test(value)) {
                    updateData(info.row.index, info.column.id, value);
                } else {
                    alert('Invalid mobile number format');
                }
            }}
            onBlur={() => updateData(info.row.index, info.column.id, info.getValue())}
            className="border p-1"
        />
    );
}

// Function to get the appropriate cell component based on input type
function InputCellType({ input_type, ...props }: any) {
    const components: any = {
        text: TextInputCell,
        number: NumberInputCell,
        checkbox: CheckBoxCell,
        progress: ProgressBarCell,
        email: EmailCell,
        url: UrlCell,
        datetime: DateTimeCell,
        radio: RadioCell,
        tel: MobileNumberInputCell,
        noEdit: NoEditCell,
    };

    const CellComponent = components[input_type] || NoEditCell;

    return <CellComponent {...props} />;
}

export {
    NoEditCell,
    TextInputCell,
    NumberInputCell,
    CheckBoxCell,
    ProgressBarCell,
    EmailCell,
    UrlCell,
    DateTimeCell,
    MobileNumberInputCell,
    RadioCell,
    InputCellType,
};
