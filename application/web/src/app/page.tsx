import HomeActions from "@/components/HomeActions";

export default function HomePage() {
  return (
    <main className="space-y-10">
      <section className="card hero">
        <div className="hero-grid">
          <div className="space-y-4">
            <span className="badge">Private by default</span>
            <h1 className="hero-title"> Notes Organizer</h1>
            <p className="hero-subtitle">
              Capture daily work notes, attach documents, and share selected notes with public or unlisted links.
            </p>

            <HomeActions />

            <div className="text-muted text-sm">
              Organized by day, ready for quick searching, and designed for focus.
            </div>
          </div>

          <div className="hero-panel">
            <div className="font-semibold">Today at a glance</div>
            <div className="hero-list mt-3">
              <div className="hero-list-item">
                <span className="hero-dot" />
                <div>Keep notes private until you decide to share.</div>
              </div>
              <div className="hero-list-item">
                <span className="hero-dot" />
                <div>Attach PDFs, slides, and spreadsheets to each note.</div>
              </div>
              <div className="hero-list-item">
                <span className="hero-dot" />
                <div>Search and edit notes in a single, fast flow.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="card feature-card">
          <h3 className="font-semibold">Private by default</h3>
          <p className="text-muted text-sm">Only you can access notes until visibility is changed.</p>
        </div>
        <div className="card feature-card">
          <h3 className="font-semibold">Fast navigation</h3>
          <p className="text-muted text-sm">Notes list, editor, and share links in one flow.</p>
        </div>
        <div className="card feature-card">
          <h3 className="font-semibold">Attachments</h3>
          <p className="text-muted text-sm">Upload PDF, DOC, XLS, or PPT files and download anytime.</p>
        </div>
      </section>
    </main>
  );
}
