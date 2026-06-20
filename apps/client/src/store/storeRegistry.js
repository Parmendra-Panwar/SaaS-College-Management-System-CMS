let store = null;

export const registerStore = (s) => {
    store = s;
};

export const getStore = () => {
    return store;
};
