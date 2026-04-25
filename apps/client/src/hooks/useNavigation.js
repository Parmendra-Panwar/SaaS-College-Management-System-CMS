import { useSelector } from 'react-redux';

/**
 * Navigation config per role.
 * Each item maps a sidebar id → label and the URL segment under /dashboard/.
 * The "path" field is the URL segment (matches the <Route path="..."> in the router config).
 */
const NAV_CONFIG = {
    Admin: [
        { id: 'colleges',    label: 'Colleges',         path: 'colleges' },
        { id: 'managers',    label: 'Managers',          path: 'managers' },
        { id: 'requests',    label: 'College Requests',  path: 'requests' },
        { id: 'departments', label: 'Departments',       path: 'departments' },
        { id: 'classes',     label: 'Classes',           path: 'classes' },
        { id: 'students',    label: 'Manage Students',   path: 'students' },
        { id: 'teachers',    label: 'Manage Teachers',   path: 'teachers' },
        { id: 'attendance',  label: 'Attendance',        path: 'attendance' },
    ],
    Principal: [
        { id: 'departments', label: 'Departments',     path: 'departments' },
        { id: 'classes',     label: 'Classes',          path: 'classes' },
        { id: 'students',    label: 'Manage Students',  path: 'students' },
        { id: 'teachers',    label: 'Manage Teachers',  path: 'teachers' },
        { id: 'attendance',  label: 'Attendance',       path: 'attendance' },
    ],
    // Manager shares the same nav as Principal
    Manager: [
        { id: 'departments', label: 'Departments',     path: 'departments' },
        { id: 'classes',     label: 'Classes',          path: 'classes' },
        { id: 'students',    label: 'Manage Students',  path: 'students' },
        { id: 'teachers',    label: 'Manage Teachers',  path: 'teachers' },
        { id: 'attendance',  label: 'Attendance',       path: 'attendance' },
    ],
    Teacher: [
        { id: 'attendance',  label: 'Attendance',       path: 'attendance' },
        { id: 'grades',      label: 'Input Grades',     path: 'grades' },
        { id: 'discipline',  label: 'Discipline / Notes', path: 'discipline' },
    ],
    Student: [
        { id: 'dashboard', label: 'Dashboard', path: 'home' },
    ],
};

/**
 * Returns the default landing path for a given role.
 * Used by <RoleRedirect> and any programmatic navigation.
 */
export const getDefaultPath = (role) => {
    switch (role) {
        case 'Admin':                   return 'colleges';
        case 'Principal': case 'Manager': return 'departments';
        case 'Teacher':                 return 'attendance';
        case 'Student':                 return 'home';
        default:                        return 'home';
    }
};

/**
 * Hook that returns the nav items for the current user's role.
 */
export const useNavigation = () => {
    const { user } = useSelector(state => state.auth);
    const role = user?.role;
    return {
        navItems: NAV_CONFIG[role] || [],
        defaultPath: getDefaultPath(role),
        role,
        user,
    };
};
