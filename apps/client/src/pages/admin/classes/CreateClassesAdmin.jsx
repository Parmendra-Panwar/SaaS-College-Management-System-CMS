import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import { useToast } from '@hooks/useToast';
import EditClassesAdmin from '@/pages/admin/classes/EditClassesAdmin';
import PageLayout from '@/components/PageLayout';

const CreateClassesAdmin = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { accessibleColleges: colleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    const handleSuccess = () => {
        toast.success("Classes created successfully");
        dispatch(fetchLookups());
    };

    return (
        <PageLayout title="Create Classes" description="Add multiple classes to your academic structure at once" >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <EditClassesAdmin
                    mode="create"
                    editingItem={null}
                    onSuccess={handleSuccess}
                    colleges={colleges}
                />
            </div>
        </PageLayout>
    );
};

export default CreateClassesAdmin;