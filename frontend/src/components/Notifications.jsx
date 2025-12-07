import React from "react";
import { Droplet } from "lucide-react";

const Notifications = ({ notifications }) => {
  return (
    <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg z-30 animate-in fade-in-5 slide-in-from-top-2 duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
          Benachrichtigungen
        </h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="mt-1 flex-shrink-0 text-blue-500">
                  <Droplet size={18} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {notif.message}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Du bist auf dem neuesten Stand! ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
