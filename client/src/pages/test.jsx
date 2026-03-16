import { useState, useEffect } from 'react';
import 'preline/preline'; // Make sure this is imported in your global CSS or layout

export default function OneModalManyButtons() {
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    { id: 1, name: 'Alice Johnson', role: 'Developer' },
    { id: 2, name: 'Bob Smith', role: 'Designer' },
    { id: 3, name: 'Charlie Brown', role: 'Product Manager' },
  ];

  // Re-init Preline when buttons render
  useEffect(() => {
    import('preline').then(({ HSOverlay }) => {
      HSOverlay?.autoInit();
    });
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>

      {/* Buttons */}
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            data-hs-overlay="#shared-modal"
            type="button"
            className="block w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open Modal for {user.name}
          </button>
        ))}
      </div>

      {/* One Shared Modal */}
      <div
        id="shared-modal"
        className="hs-overlay hidden fixed inset-0 z-[60] bg-black bg-opacity-50 overflow-y-auto"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="sm:max-w-lg sm:w-full mx-auto mt-20 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">
                User Info
              </h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                data-hs-overlay="#shared-modal"
              >
                ✕
              </button>
            </div>

            <div>
              {selectedUser ? (
                <div>
                  <p className="text-gray-800 font-medium">
                    Name: {selectedUser.name}
                  </p>
                  <p className="text-gray-600">Role: {selectedUser.role}</p>
                </div>
              ) : (
                <p>No user selected.</p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                data-hs-overlay="#shared-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
