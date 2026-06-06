currently in the global pages i am not fetching the colleges / class list, in every module i am fetching the colleges list separately so this is the bad idea, possible improvement is i should manage it in the redux and should call atleast few api in the global components like nevbar or side bar or root layout component.

this is the code where the real issue is
```
useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (selectedCollegeId) {
            dispatch(fetchLookups(selectedCollegeId));
        }
    }, [dispatch, selectedCollegeId]);

```

better i can do is divide the api for global lookup and the api that are specfic to the page and based on the role 