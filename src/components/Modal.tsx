import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { closeModal } from '../redux/slices/modalSlice';

// Define props interface
interface ModalProps {
    title: string;
    ContentComponent: React.ElementType; // This allows passing a component
}

const Modal: React.FC<ModalProps> = ({ title, ContentComponent }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isOpen = useSelector((state: RootState) => state.modal.isOpen);

    // Close the modal when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modal = document.getElementById('modal');
            if (modal && !modal.contains(event.target as Node)) {
                dispatch(closeModal());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dispatch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
            <div
                id="modal"
                className="bg-white p-8 rounded-lg shadow-lg w-80"
            >
                <h2 className="text-xl mb-4 text-center font-semibold">{title}</h2>
                <ContentComponent /> {/* Render the content component */}
            </div>
        </div>
    );
};

export default Modal;
