import DebouncedInput from "./DebouncedInput";
import { useGlobalFilter } from '../context/GlobalFilterContext'; // Import the custom hook
import DataExport from "../feature/Export";
import DataImport from "../feature/Import";
import AddFields from "../feature/AddFields";



function AdditionalFeatureWrapper({ data }: any) {
    const { globalFilter, setGlobalFilter } = useGlobalFilter(); // Use the custom hook

    const styles_class = "shadow-md rounded-md bg-white w-[35px] h-[35px] text-gray-300"

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
                {/* import feature */}
                <DataImport styles={styles_class} />
                {/* export feature */}
                <DataExport data={data} styles={styles_class} />
                {/* Add new row data or column fields */}
                <AddFields styles={styles_class} />
            </div>
        </div>
    )
}

export default AdditionalFeatureWrapper