import { TbDragDrop2 } from 'react-icons/tb'

function DragBtn({ attributes, listeners }: any) {
    return (
        <button className='mt-1 bg-gray-300 rounded-sm' {...attributes} {...listeners}>
            <TbDragDrop2 color='white' />
        </button>
    )
}

export default DragBtn