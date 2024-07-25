import * as Imports from '../imports/import';  // Import everything from imports.ts


export function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & Imports.HTMLProps<HTMLInputElement>) {
    const ref = Imports.React.useRef<HTMLInputElement>(null!)

    Imports.React.useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate])

    return (
        <input
            type="checkbox"
            ref={ref}
            className={className + ' cursor-pointer'}
            {...rest}
        />
    )
}