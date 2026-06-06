if (process.env.NODE_ENV !== 'development') {
  const initPostHog = () =>
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
        api_host: '/supraph',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        disable_session_recording: true,
        enable_recording_console_log: false,
        disable_surveys: true,
      })
    })

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(initPostHog)
  } else {
    window.addEventListener('load', initPostHog, { once: true })
  }
}
