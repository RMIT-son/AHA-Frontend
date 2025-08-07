import { memo } from 'react';

const AvatarInside = memo(({ user }) => {
    const initial = user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";
    
    return (
        <div className="w-6 h-6 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2 flex-shrink-0">
            {initial.toUpperCase()}
        </div>
    );
});

AvatarInside.displayName = 'AvatarInside';

export default AvatarInside;