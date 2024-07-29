import { TbTableExport } from 'react-icons/tb';
import Papa from 'papaparse';

function DataExport({ data }: any) {
    const dataExport = () => {
        // Convert data to CSV
        const csv = Papa.unparse(data);

        // Create a blob from the CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        // Create a link to trigger the download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div>
            <TbTableExport
                onClick={dataExport}
                className="shadow-md rounded-md bg-white w-[35px] h-[35px] text-gray-300 cursor-pointer"
            />
        </div>
    )
}

export default DataExport;
