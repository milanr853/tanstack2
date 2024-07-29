


import { TbTableImport } from 'react-icons/tb'
import { useDispatch } from 'react-redux';
import { openModal } from '../redux/slices/modalSlice';

function DataImport({ styles }: any) {
    const dispatch = useDispatch();

    return (
        <TbTableImport
            className={styles}
            cursor={'pointer'}
            onClick={() => dispatch(openModal())}
        />
    )
}

export default DataImport