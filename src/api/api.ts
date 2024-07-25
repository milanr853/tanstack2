export const dataApi = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({
            headers:
                [{ title: "firstName", type: 'string' },
                { title: "lastName", type: 'string' },
                { title: "age", type: 'number' }],

            position: 'Left'
        })
    }, 1000)
})