import { MdAddCircleOutline } from "react-icons/md";
import DebouncedInput from "./DebouncedInput";
import { useGlobalFilter } from '../context/GlobalFilterContext'; // Import the custom hook
import DataExport from "../feature/Export";



function AdditionalFeatureWrapper({ data }: any) {
    const { globalFilter, setGlobalFilter } = useGlobalFilter(); // Use the custom hook

    return (
        <div className="mb-2 w-full flex h-[50px] gap-8">
            <div className="w-[200px] flex justify-start items-center">
                {/* global filter */}
                <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(String(value))}
                    className="p-2 font-lg shadow-md border border-block w-[200px]"
                    placeholder="Search all columns..."
                />
            </div>


            <div className="flex flex-grow justify-end items-end gap-6">
                {/* export feature */}
                <DataExport data={data} />
                {/* Add new row data or column fields */}
                <MdAddCircleOutline className="shadow-md rounded-md bg-white w-[35px] h-[35px] text-gray-300" cursor={'pointer'} />
            </div>
        </div>
    )
}

export default AdditionalFeatureWrapper