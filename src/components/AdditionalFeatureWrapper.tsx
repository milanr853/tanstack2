import { MdAddCircleOutline } from "react-icons/md";
import { TbTableExport } from "react-icons/tb";
import DebouncedInput from "./DebouncedInput";
import { useGlobalFilter } from '../context/GlobalFilterContext'; // Import the custom hook



function AdditionalFeatureWrapper() {
    const { globalFilter, setGlobalFilter } = useGlobalFilter(); // Use the custom hook

    return (
        <div className="mb-2 w-full flex h-[50px] gap-8">
            {/* features to right */}
            <div className="w-[200px] flex justify-start items-center">
                <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(String(value))}
                    className="p-2 font-lg shadow-md border border-block w-[200px]"
                    placeholder="Search all columns..."
                />
            </div>

            {/* features to left */}
            <div className="flex flex-grow justify-end items-end gap-6">
                <TbTableExport className="shadow-md rounded-md bg-white w-[35px] h-[35px] text-gray-300" cursor={'pointer'} />
                <MdAddCircleOutline className="shadow-md rounded-md bg-white w-[35px] h-[35px] text-gray-300" cursor={'pointer'} />
            </div>
        </div>
    )
}

export default AdditionalFeatureWrapper