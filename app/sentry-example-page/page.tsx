'use client';

function Page() {
  return (
    <div>
      <h1>Sentry Example Page (Stub)</h1>
      <p>This is a placeholder for Sentry error tracking tests.</p>
      <button
        onClick={() => {
          throw new Error("Test error from Sentry example page");
        }}
      >
        Trigger Client Error
      </button>
    </div>
  );
}

export default Page;
