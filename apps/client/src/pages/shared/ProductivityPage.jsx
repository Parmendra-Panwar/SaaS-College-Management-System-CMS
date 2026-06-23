import React from 'react';
import { useSelector } from 'react-redux';
import ProductivityModule from '@pages/ProductivityModule';

/**
 * ProductivityPage component
 * Thin wrapper that reads the user from Redux and passes it to ProductivityModule.
 */
const ProductivityPage = () => {
    const { user } = useSelector(state => state.auth);

    return <ProductivityModule user={user} />;
};

export default ProductivityPage;
