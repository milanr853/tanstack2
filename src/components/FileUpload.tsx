import React from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import Papa from 'papaparse';
import { closeModal } from '../redux/slices/modalSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

const FileUpload: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'droppable-area',
    });

    const dispatch = useDispatch<AppDispatch>();

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Prevent default behavior

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Check if the file is a CSV
            if (file.type === 'text/csv') {
                const reader = new FileReader();

                reader.onload = (event) => {
                    const csvData = event.target?.result as string;

                    // Parse the CSV data to JSON
                    Papa.parse(csvData, {
                        header: true,
                        complete: (result) => {
                            dispatch(closeModal())
                            // alert('data uploaded')
                            console.log('Parsed JSON data:', result.data);
                        },
                        error: (error: any) => {
                            console.error('Error parsing CSV:', error);
                        }
                    });
                };

                reader.readAsText(file);
            } else {
                alert('Please drop a CSV file');
            }
        }
    };

    return (
        <DndContext>
            <div
                ref={setNodeRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()} // Allow dropping
                className={`border-4 border-dashed p-8 rounded-lg flex flex-col items-center justify-center transition-colors duration-300 ${isOver ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-100'
                    }`}
            >
                <p className="text-gray-700 text-center">Drag and drop your CSV file here</p>
            </div>
        </DndContext>
    );
};

export default FileUpload;