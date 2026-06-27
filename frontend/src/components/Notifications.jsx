import React from "react";
import { Droplet } from "lucide-react";
import { useTranslation } from "react-i18next";

const Notifications = ({ notifications }) => {
  const { t } = useTranslation();

  return (
    <div
      aria-label={t("dic.notificationsTitle")}
      className="pp-card absolute right-0 top-14 z-30 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden animate-in fade-in-5 slide-in-from-top-2 duration-300"
      role="dialog"
    >
      <div className="border-b-2 border-[rgba(217,184,117,0.45)] bg-[rgba(244,226,189,0.55)] px-4 py-3">
        <p className="pp-eyebrow">{t("dic.notificationsTitle")}</p>
        <h3 className="text-lg font-bold text-[var(--text)]">
          {t("dic.notification")}
        </h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start gap-3 border-b-2 border-[rgba(217,184,117,0.28)] p-4 transition-colors last:border-b-0 hover:bg-[rgba(255,249,234,0.72)]"
              >
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[rgba(79,127,56,0.35)] bg-[rgba(79,127,56,0.12)] text-[var(--green)] shadow-[0_2px_0_rgba(111,85,44,0.16)]">
                  <Droplet size={18} />
                </div>
                <p className="text-sm font-semibold leading-relaxed text-[var(--text)]">
                  {notif.message}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <div className="pp-section-icon mx-auto mb-3">
              <Droplet size={20} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {t("dic.upToDate")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
