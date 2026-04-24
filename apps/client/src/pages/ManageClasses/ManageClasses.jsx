import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline, IoMdList } from "react-icons/io";

const ManageClasses = () => {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const rolePath = user.role.toLowerCase();

    const actions = [
        {
            title: "Create Class",
            desc: "Add a new class to your academic structure",
            path: `/${rolePath}/dashboard/classes/create`,
            icon: <IoMdAddCircleOutline size={28} />,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            title: "View Classes",
            desc: "Manage existing classes and update details",
            path: `/${rolePath}/dashboard/classes/show`,
            icon: <IoMdList size={28} />,
            color: "bg-emerald-50 text-emerald-600"
        }
    ];

    return (
        <div className="max-w-full mx-auto p-6 animate-in slide-in-from-bottom-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
                <p className="text-gray-500">Overview for {user.role} access</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="cursor-pointer group flex flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left min-h-[200px] h-full"
                    >
                        <div className={`flex items-center gap-4 p-3 rounded-xl w-fit mb-4 ${action.color}`}>
                            {action.icon}<h2 className="text-lg font-semibold text-gray-900">{action.title}</h2>
                        </div>

                        <p className="text-sm text-gray-500 mt-1 flex-grow">{action.desc}</p>
                        <span className="mt-4 text-indigo-600 text-sm font-medium group-hover:underline">
                            Go to action →
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ManageClasses;