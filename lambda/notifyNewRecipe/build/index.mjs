export const handler = async (event) => {
    console.log(JSON.stringify(event));
    await new Promise((r) => {
        setInterval(() => {
            r(undefined);
        }, 1000);
    });
    const result = {
        result: Math.random() < 0.5,
        id: event.id,
    };
    console.log(JSON.stringify(result));
    return result;
};
