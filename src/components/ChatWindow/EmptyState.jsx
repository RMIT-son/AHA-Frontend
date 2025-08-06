// components/EmptyState.jsx
import { memo } from 'react';

const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-center max-w-2xl">
            <h1 className="text-3xl font-light text-gray-800 mb-4">
                Hello! How can I assist you today?
            </h1>
        </div>
    </div>
));


export default EmptyState;