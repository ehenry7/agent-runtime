import { useTranslation } from 'react-i18next';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  useFontStore,
  type FontFamilyKey,
  type FontSizeKey,
} from '../stores/fontStore';

export function SettingsPage() {
  const { t } = useTranslation();
  const { sizeKey, familyKey, setSize, setFamily } = useFontStore();

  const currentFamily = FONT_FAMILY_OPTIONS.find((o) => o.key === familyKey);

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">{t('settings.title')}</div>
          <div className="page-subtitle">{t('settings.subtitle')}</div>
        </div>
      </div>

      {/* ---- General: Font & Display ---- */}
      <div className="card p-5 flex flex-col gap-5">
        {/* Section header */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          <span className="text-sm font-semibold text-text-strong">
            {t('settings.general.fontSectionTitle')}
          </span>
        </div>
        <p className="text-xs text-muted -mt-3">{t('settings.general.fontSectionDesc')}</p>

        {/* ---- Font size selector ---- */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('settings.general.fontSizeLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`btn sm ${sizeKey === opt.key ? 'primary' : ''}`}
                onClick={() => setSize(opt.key as FontSizeKey)}
              >
                {t(`settings.general.fontSize.${opt.key}`)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-1">{t('settings.general.fontSizeHint')}</p>
        </div>

        {/* ---- Font family selector ---- */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('settings.general.fontFamilyLabel')}</label>
          <div className="flex flex-col gap-1.5">
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                  familyKey === opt.key
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border hover:border-border-hover bg-bg-elevated'
                }`}
                onClick={() => setFamily(opt.key as FontFamilyKey)}
              >
                {/* Radio indicator */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    familyKey === opt.key ? 'border-accent' : 'border-muted'
                  }`}
                >
                  {familyKey === opt.key && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                {/* Label rendered in the actual font */}
                <span className="text-sm font-medium" style={{ fontFamily: opt.stack }}>
                  {t(`settings.general.fontFamily.${opt.labelKey}`)}
                </span>
                <span className="text-xs text-muted ml-auto" style={{ fontFamily: opt.stack }}>
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ---- Live preview ---- */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('settings.general.previewLabel')}</label>
          <div
            className="rounded-lg border border-border p-4 bg-bg-elevated flex flex-col gap-2"
            style={{ fontFamily: currentFamily?.stack }}
          >
            <div
              className="font-semibold text-text-strong"
              style={{ fontSize: 'calc(1.25rem * var(--font-scale, 1))' }}
            >
              {t('settings.general.previewHeading')}
            </div>
            <div style={{ fontSize: 'var(--font-size-base)' }}>
              {t('settings.general.previewBody')}
            </div>
            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              {t('settings.general.previewCaption')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
