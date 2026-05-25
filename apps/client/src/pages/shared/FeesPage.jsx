import React from 'react';
import { useSelector } from 'react-redux';
import FeesModule from '@pages/FeesModule';

const FeesPage = () => {
    const { user } = useSelector(state => state.auth);
    return <FeesModule user={user} />;
};

export default FeesPage;
